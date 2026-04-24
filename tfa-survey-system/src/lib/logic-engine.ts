import {
  SurveyQuestion,
  RespondentRole,
  Sector,
  LogicCondition,
  LogicRule,
} from "@/lib/types";

// ─── Core Visibility Resolver ─────────────────────────────────────────────────

export interface SurveyContext {
  role: RespondentRole | null;
  sector: Sector | null;
  answers: Record<string, string | string[] | number>;
}

function evaluateCondition(cond: LogicCondition, ctx: SurveyContext): boolean {
  let fieldValue: string | string[] | number | null = null;

  if (cond.field === "role") {
    fieldValue = ctx.role;
  } else if (cond.field === "sector") {
    fieldValue = ctx.sector;
  } else if (cond.field === "question" && cond.questionId) {
    fieldValue = ctx.answers[cond.questionId] ?? null;
  }

  if (fieldValue === null) return false;

  const target = cond.value;

  switch (cond.operator) {
    case "equals":
      return fieldValue === target;
    case "not_equals":
      return fieldValue !== target;
    case "in":
      if (Array.isArray(target)) {
        if (Array.isArray(fieldValue)) {
          return (fieldValue as string[]).some((v) => (target as string[]).includes(v));
        }
        return (target as string[]).includes(fieldValue as string);
      }
      return false;
    case "not_in":
      if (Array.isArray(target)) {
        if (Array.isArray(fieldValue)) {
          return !(fieldValue as string[]).some((v) => (target as string[]).includes(v));
        }
        return !(target as string[]).includes(fieldValue as string);
      }
      return false;
    default:
      return false;
  }
}

function evaluateRule(rule: LogicRule, ctx: SurveyContext): boolean {
  const results = rule.conditions.map((c) => evaluateCondition(c, ctx));
  return rule.conditionLogic === "AND" ? results.every(Boolean) : results.some(Boolean);
}

// ─── Question Visibility ──────────────────────────────────────────────────────

export function isQuestionVisible(q: SurveyQuestion, ctx: SurveyContext): boolean {
  // Role check
  if (ctx.role && !q.visibleToRoles.includes(ctx.role)) return false;
  if (ctx.role && q.hiddenFromRoles?.includes(ctx.role)) return false;

  // Sector check
  if (ctx.sector && !q.visibleToSectors.includes(ctx.sector)) return false;

  // Logic rules (any "hide" rule that evaluates to true hides the question)
  if (q.logicRules) {
    for (const rule of q.logicRules) {
      if (rule.action === "hide" && evaluateRule(rule, ctx)) return false;
    }
  }

  return true;
}

// ─── Filtered Question List ───────────────────────────────────────────────────

export function getVisibleQuestions(
  questions: SurveyQuestion[],
  ctx: SurveyContext
): SurveyQuestion[] {
  return questions
    .filter((q) => q.status === "published")
    .sort((a, b) => a.order - b.order)
    .filter((q) => isQuestionVisible(q, ctx));
}

// ─── Role-based Adaptive Logic Map ───────────────────────────────────────────
// Returns human-readable logic description for preview/admin

export const ADAPTIVE_LOGIC_MAP: Record<
  RespondentRole,
  { showBlocks: string[]; hiddenQuestions: string[]; note: string }
> = {
  ld_hr: {
    showBlocks: ["market_demand", "training_volume", "external_providers", "future_trends", "strategic_partnership"],
    hiddenQuestions: [],
    note: "Full survey — L&D is the primary respondent",
  },
  finance: {
    showBlocks: ["market_demand", "training_volume", "external_providers", "future_trends", "strategic_partnership"],
    hiddenQuestions: ["q02", "q03", "q08", "q09", "q13"],
    note: "Finance sees budget trend & volume questions; hides demand perception questions",
  },
  business_leader: {
    showBlocks: ["market_demand", "training_volume", "external_providers", "future_trends", "strategic_partnership"],
    hiddenQuestions: ["q05"],
    note: "Business leaders focus on capability gaps, providers, future trends",
  },
  regulator: {
    showBlocks: ["market_demand", "external_providers", "future_trends", "strategic_partnership"],
    hiddenQuestions: ["q04", "q05", "q06", "q07", "q08"],
    note: "Regulators focus on compliance training, future trends, and partnership",
  },
  government: {
    showBlocks: ["market_demand", "future_trends", "strategic_partnership"],
    hiddenQuestions: ["q04", "q05", "q06", "q07", "q08"],
    note: "Government entities focus on market demand signals and strategic outlook",
  },
  vendor: {
    showBlocks: ["market_demand", "external_providers", "future_trends", "strategic_partnership"],
    hiddenQuestions: ["q04", "q05", "q07", "q12"],
    note: "Vendors see market demand, gap analysis, and partnership questions",
  },
};

// ─── Confidence Score Calculator ──────────────────────────────────────────────

export function calculateConfidenceScore(
  answers: Record<string, string | string[] | number>,
  visibleQuestions: SurveyQuestion[]
): number {
  const required = visibleQuestions.filter((q) => q.required);
  const answered = required.filter((q) => {
    const a = answers[q.id];
    if (a === undefined || a === null) return false;
    if (typeof a === "string") return a.trim().length > 0;
    if (Array.isArray(a)) return a.length > 0;
    return true;
  });

  const completionRate = required.length > 0 ? answered.length / required.length : 1;

  // Detect random/inconsistent answers (heuristic: very short text for short_answer)
  let qualityPenalty = 0;
  const shortAnswers = visibleQuestions.filter((q) => q.type === "short_answer");
  shortAnswers.forEach((q) => {
    const a = answers[q.id];
    if (typeof a === "string" && a.trim().length < 5 && a.trim().length > 0) {
      qualityPenalty += 0.1;
    }
  });

  return Math.max(0, Math.min(1, completionRate - qualityPenalty));
}

// ─── Next Question Navigator ──────────────────────────────────────────────────

export function getNextQuestion(
  currentId: string,
  visibleQuestions: SurveyQuestion[],
  answers: Record<string, string | string[] | number>
): SurveyQuestion | null {
  const idx = visibleQuestions.findIndex((q) => q.id === currentId);
  if (idx === -1 || idx >= visibleQuestions.length - 1) return null;

  // Check for skip_to rules on current question
  const current = visibleQuestions[idx];
  if (current.logicRules) {
    for (const rule of current.logicRules) {
      if (rule.action === "skip_to" && rule.targetQuestionId) {
        const matches = rule.conditions.every((c) => {
          if (c.field === "question" && c.questionId === current.id) {
            return evaluateCondition(c, { role: null, sector: null, answers });
          }
          return false;
        });
        if (matches) {
          const target = visibleQuestions.find((q) => q.id === rule.targetQuestionId);
          return target ?? null;
        }
      }
    }
  }

  return visibleQuestions[idx + 1];
}
