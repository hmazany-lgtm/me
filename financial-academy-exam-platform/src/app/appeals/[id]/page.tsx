"use client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader, Card, CardHeader, Badge, StatusBadge, Button, InfoBanner } from "@/components/ui";
import { APPEALS, CANDIDATES } from "@/data/seed";
import { titleCase, userName, shortDate } from "@/lib/format";
import { Icon } from "@/components/Icon";

const TODAY = new Date("2026-07-04");

export default function AppealDetail({ params }: { params: { id: string } }) {
  const appeal = APPEALS.find((a) => a.id === params.id);
  if (!appeal) return notFound();

  const cand = CANDIDATES.find((c) => c.id === appeal.candidateId);
  const dueDate = new Date(appeal.slaDue);
  const daysLeft = Math.round((dueDate.getTime() - TODAY.getTime()) / 86_400_000);
  const overdue = daysLeft < 0;

  return (
    <div>
      <PageHeader
        title={appeal.appealNo}
        subtitle={`${titleCase(appeal.category)} appeal · ${cand ? cand.fullName : "Unknown candidate"}`}
        actions={<StatusBadge status={appeal.status} />}
      />

      <div className="mb-4">
        <InfoBanner tone="amber">
          <span className="font-medium">Reviewer duty.</span> Appeal reviewers must NOT expose secure question content, answer keys, or scoring keys to candidates. Provide domain-level feedback only. Every access to the underlying item bank is audited.
        </InfoBanner>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Overview */}
          <Card>
            <CardHeader title="Appeal detail" />
            <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <Field label="Category" value={titleCase(appeal.category)} />
              <Field label="Assigned to" value={userName(appeal.assignedTo)} />
              <Field label="SLA due" value={shortDate(appeal.slaDue)} />
              <Field label="Candidate" value={cand ? cand.fullName : "—"} />
              <Field label="Session" value={appeal.sessionId} mono />
              <Field label="Status" value={titleCase(appeal.status)} />
              <div className="md:col-span-3">
                <p className="text-[11px] uppercase tracking-wide text-navy-400 mb-0.5">Description</p>
                <p className="text-navy-700">{appeal.description}</p>
              </div>
              {appeal.decision && (
                <div className="md:col-span-3">
                  <p className="text-[11px] uppercase tracking-wide text-navy-400 mb-0.5">Decision</p>
                  <p className="text-navy-700">{appeal.decision}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Evidence */}
          <Card>
            <CardHeader title="Evidence submitted" subtitle="Provided by the candidate" />
            <div className="p-5">
              {appeal.evidence.length === 0 ? (
                <p className="text-sm text-navy-400">No supporting evidence was submitted.</p>
              ) : (
                <ul className="space-y-2">
                  {appeal.evidence.map((f) => (
                    <li key={f} className="flex items-center gap-2 rounded-lg border border-navy-100 px-3 py-2 text-sm text-navy-700">
                      <Icon name="report" className="w-4 h-4 text-navy-400" />
                      <span className="font-mono text-[12px]">{f}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          {/* Communication history */}
          <Card>
            <CardHeader title="Communication history" subtitle="Correspondence log between the candidate and reviewers" />
            <div className="p-5 space-y-4">
              {appeal.communications.map((c, i) => (
                <div key={i} className="relative pl-5">
                  <span className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-teal-500" />
                  <div className="flex items-center gap-2">
                    <Badge tone={c.from === "candidate" ? "blue" : "teal"}>{titleCase(c.from)}</Badge>
                    <span className="text-[11px] text-navy-400">{shortDate(c.date)}</span>
                  </div>
                  <p className="text-sm text-navy-700 mt-1">{c.note}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* SLA countdown */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-navy-800 mb-2">SLA countdown</h3>
            <div className={`text-2xl font-semibold tabular-nums ${overdue ? "text-rose-600" : daysLeft <= 2 ? "text-gold-600" : "text-emerald-600"}`}>
              {overdue ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
            </div>
            <p className="text-[11px] text-navy-400 mt-1">Target resolution by {shortDate(appeal.slaDue)}.</p>
          </Card>

          {/* Decision panel */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-navy-800 mb-3">Decision panel</h3>
            <div className="flex flex-col gap-2">
              <Button variant="primary"><Icon name="check" className="w-4 h-4" />Uphold</Button>
              <Button variant="secondary"><Icon name="gavel" className="w-4 h-4" />Partially uphold</Button>
              <Button variant="danger"><Icon name="x" className="w-4 h-4" />Reject</Button>
            </div>
            <p className="mt-3 text-[11px] text-navy-400">Decisions are recorded, communicated to the candidate, and countersigned by the certification manager.</p>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-navy-800 mb-3">Linked records</h3>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-navy-400">Session</dt>
                <dd><Link href={`/sessions/${appeal.sessionId}`} className="font-medium text-teal-600 hover:underline">{appeal.sessionId}</Link></dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-navy-400">Assigned to</dt>
                <dd className="font-medium text-navy-700">{userName(appeal.assignedTo)}</dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-navy-400 mb-0.5">{label}</p>
      <p className={`text-navy-800 ${mono ? "font-mono text-[12px]" : "font-medium"}`}>{value}</p>
    </div>
  );
}
