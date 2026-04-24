"use client";

import { useState } from "react";
import { useAdminStore } from "@/lib/store";
import {
  RespondentRole,
  ROLE_LABELS,
  LogicRule,
  LogicCondition,
} from "@/lib/types";
import { ADAPTIVE_LOGIC_MAP as LogicMap } from "@/lib/logic-engine";
import { v4 as uuidv4 } from "uuid";

const ROLES: RespondentRole[] = ["ld_hr", "finance", "business_leader", "regulator", "government", "vendor"];

// ─── Rule Card ────────────────────────────────────────────────────────────────

function RuleCard({
  rule,
  questionTextEn,
  onDelete,
  onUpdate,
}: {
  rule: LogicRule;
  questionId?: string;
  questionTextEn: string;
  onDelete: () => void;
  onUpdate: (r: LogicRule) => void;
}) {
  const cond = rule.conditions[0];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Applied to
          </p>
          <p className="text-sm text-slate-800 font-medium line-clamp-2">{questionTextEn}</p>
        </div>
        <button onClick={onDelete} className="text-slate-300 hover:text-red-400 text-lg flex-shrink-0">
          ✕
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 text-xs">
        <div>
          <label className="text-slate-400 block mb-1">IF Field</label>
          <select
            className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-slate-700"
            value={cond?.field ?? "role"}
            onChange={(e) => {
              const newCond: LogicCondition = { ...(cond ?? { operator: "equals", value: "" }), field: e.target.value as "role" | "sector" | "question" };
              onUpdate({ ...rule, conditions: [newCond] });
            }}
          >
            <option value="role">Role</option>
            <option value="sector">Sector</option>
            <option value="question">Answer to question</option>
          </select>
        </div>
        <div>
          <label className="text-slate-400 block mb-1">Operator</label>
          <select
            className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-slate-700"
            value={cond?.operator ?? "equals"}
            onChange={(e) => {
              const newCond: LogicCondition = { ...(cond ?? { field: "role", value: "" }), operator: e.target.value as LogicCondition["operator"] };
              onUpdate({ ...rule, conditions: [newCond] });
            }}
          >
            <option value="equals">equals</option>
            <option value="not_equals">not equals</option>
            <option value="in">is one of</option>
            <option value="not_in">is not one of</option>
          </select>
        </div>
        <div>
          <label className="text-slate-400 block mb-1">Value</label>
          {cond?.field === "role" ? (
            <select
              className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-slate-700"
              value={typeof cond.value === "string" ? cond.value : ""}
              onChange={(e) => {
                const newCond: LogicCondition = { ...cond, value: e.target.value };
                onUpdate({ ...rule, conditions: [newCond] });
              }}
            >
              <option value="">Select role</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r].en}</option>
              ))}
            </select>
          ) : (
            <input
              className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-slate-700"
              value={typeof cond?.value === "string" ? cond.value : ""}
              onChange={(e) => {
                const newCond: LogicCondition = { ...(cond ?? { field: "role", operator: "equals" }), value: e.target.value };
                onUpdate({ ...rule, conditions: [newCond] });
              }}
              placeholder="Value..."
            />
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-xs text-slate-400">Then</label>
        <select
          className="text-xs px-2 py-1.5 border border-slate-200 rounded-lg text-slate-700"
          value={rule.action}
          onChange={(e) => onUpdate({ ...rule, action: e.target.value as LogicRule["action"] })}
        >
          <option value="show">Show this question</option>
          <option value="hide">Hide this question</option>
          <option value="skip_to">Skip to question</option>
        </select>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${rule.action === "hide" ? "bg-red-400" : "bg-green-400"}`}></span>
          <span className="text-xs text-slate-500 capitalize">{rule.action}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LogicBuilderPage() {
  const { questions, updateQuestion } = useAdminStore();
  const [selectedRole, setSelectedRole] = useState<RespondentRole>("ld_hr");

  const questionsWithRules = questions.filter((q) => (q.logicRules ?? []).length > 0);

  const addRule = (questionId: string) => {
    const q = questions.find((x) => x.id === questionId);
    if (!q) return;
    const newRule: LogicRule = {
      id: uuidv4(),
      conditions: [{ field: "role", operator: "equals", value: "" }],
      conditionLogic: "AND",
      action: "show",
    };
    updateQuestion(questionId, { logicRules: [...(q.logicRules ?? []), newRule] });
  };

  const updateRule = (questionId: string, ruleId: string, updated: LogicRule) => {
    const q = questions.find((x) => x.id === questionId);
    if (!q) return;
    updateQuestion(questionId, {
      logicRules: (q.logicRules ?? []).map((r) => (r.id === ruleId ? updated : r)),
    });
  };

  const deleteRule = (questionId: string, ruleId: string) => {
    const q = questions.find((x) => x.id === questionId);
    if (!q) return;
    updateQuestion(questionId, {
      logicRules: (q.logicRules ?? []).filter((r) => r.id !== ruleId),
    });
  };

  const roleMap = LogicMap[selectedRole];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Logic Builder</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Define conditional visibility rules per question
        </p>
      </div>

      {/* Adaptive Logic Map Reference */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">Adaptive Logic Map — Preview by Role</h2>
          <select
            className="text-sm px-3 py-2 border border-slate-200 rounded-lg bg-white"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as RespondentRole)}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r].en}</option>
            ))}
          </select>
        </div>

        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
          <p className="text-sm font-medium text-slate-700 mb-3">
            Role: <span className="text-blue-600">{ROLE_LABELS[selectedRole].en}</span>
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Visible Blocks</p>
              <div className="space-y-1">
                {roleMap.showBlocks.map((b) => (
                  <div key={b} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                    <span className="text-slate-700">{b.replace(/_/g, " ")}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Hidden Questions</p>
              {roleMap.hiddenQuestions.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {roleMap.hiddenQuestions.map((id) => (
                    <span key={id} className="px-2 py-0.5 rounded bg-red-50 text-red-600 text-xs font-mono">
                      {id}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-slate-400 text-xs">No hidden questions</span>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3 border-t border-slate-200 pt-3">
            {roleMap.note}
          </p>
        </div>
      </div>

      {/* Logic Rule Templates */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-800 mb-4">Logic Rule Templates</h2>
        <div className="space-y-3 text-sm">
          {[
            { rule: "IF role = Finance", then: "THEN show budget trend questions (q05)", color: "blue" },
            { rule: "IF role = Regulator", then: "THEN show compliance training questions (q12)", color: "purple" },
            { rule: "IF role = Vendor", then: "THEN hide internal dependency questions (q07)", color: "orange" },
            { rule: "IF sector = Insurance", then: "THEN show actuarial / compliance questions", color: "green" },
            { rule: "IF role = Government", then: "THEN show market demand + future trends only", color: "indigo" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-${item.color}-400`}></div>
              <div>
                <span className="font-mono text-xs font-semibold text-slate-700">{item.rule}</span>
                <span className="text-slate-400 mx-2">→</span>
                <span className="text-slate-600 text-xs">{item.then}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Per-Question Rule Editor */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">Question Logic Rules</h2>
          <p className="text-xs text-slate-400">{questionsWithRules.length} questions have custom rules</p>
        </div>

        <div className="space-y-4">
          {questions.sort((a, b) => a.order - b.order).map((q) => (
            <div key={q.id} className="bg-white rounded-xl border border-slate-200">
              <div className="px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 line-clamp-1">{q.textEn || "(No text)"}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {(q.logicRules ?? []).length} rule(s)
                  </p>
                </div>
                <button
                  onClick={() => addRule(q.id)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 flex-shrink-0"
                >
                  + Add Rule
                </button>
              </div>

              {(q.logicRules ?? []).length > 0 && (
                <div className="px-5 pb-4 space-y-3 border-t border-slate-100 pt-3">
                  {(q.logicRules ?? []).map((rule) => (
                    <RuleCard
                      key={rule.id}
                      rule={rule}
                      questionId={q.id}
                      questionTextEn={q.textEn}
                      onDelete={() => deleteRule(q.id, rule.id)}
                      onUpdate={(updated) => updateRule(q.id, rule.id, updated)}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
