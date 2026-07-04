/**
 * Psychometric & question-bank analytics used across the platform. Pure
 * functions over the sample data so dashboards, reports, and the item-analysis
 * views all compute consistently.
 */
import type { Question, ExamBlueprint } from "./types";

export interface BankHealth {
  score: number;
  band: string;
  factors: { label: string; value: number; weight: number; note: string }[];
  recommendations: string[];
}

/**
 * Question-bank health score (0–100) — a weighted composite of coverage,
 * exposure, item quality, flags, retirement, difficulty balance, and age.
 */
export function computeBankHealth(questions: Question[], certId?: string): BankHealth {
  const qs = certId ? questions.filter((q) => q.certificationId === certId) : questions;
  const total = qs.length || 1;
  const active = qs.filter((q) => ["active", "approved"].includes(q.status)).length;
  const flagged = qs.filter((q) => q.flagCount > 0).length;
  const retired = qs.filter((q) => q.status === "retired").length;
  const compromised = qs.filter((q) => q.status === "compromised").length;
  const overexposed = qs.filter((q) => q.usageCount > q.exposureLimit).length;
  const poorDisc = qs.filter((q) => q.discriminationIndex < 0.15).length;
  const goodDifficulty = qs.filter((q) => q.difficultyIndex >= 0.3 && q.difficultyIndex <= 0.85).length;

  const coverage = Math.min(100, (active / total) * 100);
  const exposureHealth = 100 - (overexposed / total) * 100;
  const qualityHealth = 100 - (poorDisc / total) * 100;
  const flagHealth = 100 - (flagged / total) * 100;
  const difficultyBalance = (goodDifficulty / total) * 100;
  const integrityHealth = 100 - (compromised / total) * 200; // compromised weighted heavily

  const factors = [
    { label: "Active-question coverage", value: Math.round(coverage), weight: 0.25, note: `${active}/${total} active/approved` },
    { label: "Exposure control", value: Math.round(exposureHealth), weight: 0.2, note: `${overexposed} over exposure limit` },
    { label: "Item discrimination quality", value: Math.round(qualityHealth), weight: 0.2, note: `${poorDisc} weak-discrimination items` },
    { label: "Candidate-flag health", value: Math.round(flagHealth), weight: 0.1, note: `${flagged} flagged items` },
    { label: "Difficulty balance", value: Math.round(difficultyBalance), weight: 0.15, note: `${goodDifficulty} well-calibrated items` },
    { label: "Integrity (no compromise)", value: Math.max(0, Math.round(integrityHealth)), weight: 0.1, note: `${compromised} compromised items` },
  ];

  const score = Math.max(0, Math.min(100, Math.round(factors.reduce((s, f) => s + f.value * f.weight, 0))));
  const band = score >= 80 ? "Healthy" : score >= 60 ? "Adequate" : score >= 40 ? "At risk" : "Critical";

  const recommendations: string[] = [];
  if (overexposed) recommendations.push(`Retire and replace ${overexposed} over-exposed question(s).`);
  if (poorDisc) recommendations.push(`Send ${poorDisc} low-discrimination item(s) for psychometric review.`);
  if (flagged) recommendations.push(`Triage ${flagged} candidate-flagged item(s).`);
  if (compromised) recommendations.push(`Escalate ${compromised} compromised item(s) to the Security Committee.`);
  if (coverage < 70) recommendations.push("Increase active-question supply to meet blueprint minimums.");
  if (!recommendations.length) recommendations.push("Bank is healthy — maintain routine monthly review cadence.");

  return { score, band, factors, recommendations };
}

/** Blueprint readiness — R/Y/G per domain based on available active questions. */
export function blueprintReadiness(bp: ExamBlueprint) {
  const domains = bp.domains.map((d) => {
    const ratio = d.availableActive / (d.minActiveQuestions || 1);
    const status: "green" | "amber" | "red" = ratio >= 1 ? "green" : ratio >= 0.7 ? "amber" : "red";
    return { ...d, ratio, status };
  });
  const worst = domains.some((d) => d.status === "red") ? "red" : domains.some((d) => d.status === "amber") ? "amber" : "green";
  return { domains, overall: worst };
}

/** Distractor analysis for a single question. */
export function distractorAnalysis(q: Question) {
  return q.options.map((o) => ({
    ...o,
    verdict: o.isCorrect
      ? o.chosenPct < 40 ? "Key chosen by too few — review difficulty" : "Key functioning"
      : o.chosenPct < 3 ? "Non-functioning distractor" : o.chosenPct > 35 ? "Strong distractor — possible mis-key" : "Functioning distractor",
  }));
}

/** Item-level flags used by item-analysis reports. */
export function itemFlags(q: Question): { label: string; tone: "red" | "amber" | "green" }[] {
  const flags: { label: string; tone: "red" | "amber" | "green" }[] = [];
  if (q.discriminationIndex < 0) flags.push({ label: "Negative discrimination", tone: "red" });
  else if (q.discriminationIndex < 0.15) flags.push({ label: "Low discrimination", tone: "amber" });
  if (q.difficultyIndex > 0.9) flags.push({ label: "Too easy", tone: "amber" });
  if (q.difficultyIndex < 0.25) flags.push({ label: "Too hard", tone: "amber" });
  if (q.usageCount > q.exposureLimit) flags.push({ label: "Over-exposed", tone: "red" });
  if (q.flagCount >= 3) flags.push({ label: "Frequently flagged", tone: "amber" });
  if (!flags.length) flags.push({ label: "Performing well", tone: "green" });
  return flags;
}

/** Recommendation for an item based on its stats. */
export function itemRecommendation(q: Question): string {
  if (q.status === "compromised") return "Remove from all forms — compromised.";
  if (q.usageCount > q.exposureLimit) return "Retire and replace — exposure limit exceeded.";
  if (q.discriminationIndex < 0) return "Retire or rewrite — negative discrimination.";
  if (q.discriminationIndex < 0.15) return "Revise — weak discrimination.";
  if (q.difficultyIndex > 0.92) return "Consider revision — item is too easy.";
  if (q.difficultyIndex < 0.25) return "Review — item may be too difficult or mis-keyed.";
  return "Retain in active pool.";
}
