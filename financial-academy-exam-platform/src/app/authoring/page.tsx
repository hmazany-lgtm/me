"use client";
import { useMemo } from "react";
import Link from "next/link";
import { PageHeader, Card, Kpi, Badge, InfoBanner } from "@/components/ui";
import { QUESTIONS, QUESTION_REVIEWS } from "@/data/seed";
import { titleCase, userName, certCode } from "@/lib/format";
import { Icon } from "@/components/Icon";
import type { Question, QuestionReview } from "@/lib/types";

const TODAY = "2026-07-04";

type Col = { key: string; title: string; tone: string; actions: string[] };
const COLUMNS: Col[] = [
  { key: "draft", title: "Drafted", tone: "bg-navy-100 text-navy-500", actions: ["Comment", "Submit"] },
  { key: "technical", title: "Technical Review", tone: "bg-blue-100 text-blue-600", actions: ["Comment", "Approve", "Reject", "Change request", "Escalate"] },
  { key: "language", title: "Language Review", tone: "bg-blue-100 text-blue-600", actions: ["Comment", "Approve", "Reject", "Change request", "Escalate"] },
  { key: "psychometric", title: "Psychometric Review", tone: "bg-purple-100 text-purple-600", actions: ["Comment", "Approve", "Reject", "Change request", "Escalate"] },
  { key: "regulatory", title: "Regulatory Review", tone: "bg-amber-100 text-amber-700", actions: ["Comment", "Approve", "Reject", "Change request", "Escalate"] },
  { key: "committee", title: "Committee Approval", tone: "bg-gold-300/30 text-gold-600", actions: ["Comment", "Approve", "Reject", "Escalate"] },
  { key: "active", title: "Active Pool", tone: "bg-emerald-100 text-emerald-600", actions: ["Comment", "Monitor"] },
  { key: "monitored", title: "Monitored", tone: "bg-rose-100 text-rose-600", actions: ["Comment", "Retire"] },
];

export default function AuthoringPage() {
  const reviewByQ = useMemo(() => new Map<string, QuestionReview>(QUESTION_REVIEWS.map((r) => [r.questionId, r])), []);

  const columnOf = (q: Question): string => {
    switch (q.status) {
      case "draft": return "draft";
      case "under_review": return reviewByQ.get(q.id)?.stage ?? "technical";
      case "approved": return "committee";
      case "active": return "active";
      default: return "monitored"; // suspended, retired, compromised
    }
  };

  const buckets = useMemo(() => {
    const map: Record<string, Question[]> = Object.fromEntries(COLUMNS.map((c) => [c.key, []]));
    for (const q of QUESTIONS) map[columnOf(q)].push(q);
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inDraft = buckets["draft"].length;
  const inReview = QUESTIONS.filter((q) => q.status === "under_review").length;
  const awaitingCommittee = buckets["committee"].length;
  const escalatedOverdue = QUESTION_REVIEWS.filter((r) => r.escalated || r.dueDate < TODAY).length;

  return (
    <div>
      <PageHeader
        title="Question Authoring Workflow"
        subtitle="Multi-stage item development pipeline from draft to active pool, with maker-checker controls at every gate."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Kpi label="In Draft" value={inDraft} tone="navy" />
        <Kpi label="In Review" value={inReview} tone="gold" />
        <Kpi label="Awaiting Committee" value={awaitingCommittee} tone="teal" />
        <Kpi label="Escalated / Overdue" value={escalatedOverdue} tone="red" />
      </div>

      <InfoBanner tone="amber">
        <span className="font-medium">Segregation of duties.</span> Authors cannot review or approve their own questions. Each stage is a maker-checker gate — the reviewer of one stage cannot sign off the next. All comments, approvals and escalations are audited.
      </InfoBanner>

      <div className="mt-5 overflow-x-auto pb-3">
        <div className="flex gap-3 min-w-max">
          {COLUMNS.map((col) => {
            const items = buckets[col.key];
            return (
              <div key={col.key} className="w-64 shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${col.tone}`}>{col.title}</span>
                  <span className="text-xs font-medium text-navy-400 tabular-nums">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.slice(0, 8).map((q) => {
                    const rev = reviewByQ.get(q.id);
                    const escalated = rev?.escalated || (rev ? rev.dueDate < TODAY : false);
                    const assignee = rev?.assignee ?? q.reviewerId ?? q.authorId;
                    return (
                      <Card key={q.id} className="p-3">
                        <div className="flex items-center justify-between gap-2">
                          <Link href={`/question-bank/${q.id}`} className="font-mono text-[12px] font-medium text-teal-600 hover:underline">{q.id}</Link>
                          {escalated && <Badge tone="amber">Escalated</Badge>}
                        </div>
                        <p className="text-xs text-navy-600 mt-1 truncate">{certCode(q.certificationId)} · {q.domain}</p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <Badge tone={q.difficulty === "hard" ? "red" : q.difficulty === "medium" ? "amber" : "green"}>{titleCase(q.difficulty)}</Badge>
                        </div>
                        <div className="mt-2 pt-2 border-t border-navy-50 flex items-center justify-between text-[11px] text-navy-400">
                          <span className="flex items-center gap-1"><Icon name="users" className="w-3.5 h-3.5" />{userName(assignee)}</span>
                          {rev?.dueDate && <span className="flex items-center gap-1"><Icon name="clock" className="w-3.5 h-3.5" />{rev.dueDate}</span>}
                        </div>
                      </Card>
                    );
                  })}
                  {items.length > 8 && <p className="text-[11px] text-navy-400 text-center py-1">+{items.length - 8} more</p>}
                  {items.length === 0 && <p className="text-[11px] text-navy-300 text-center py-3">Empty</p>}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {col.actions.map((a) => (
                    <span key={a} className="inline-flex items-center rounded-md bg-white ring-1 ring-inset ring-navy-200 px-1.5 py-0.5 text-[10px] font-medium text-navy-500">{a}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
