"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader, Card, Kpi, StatusBadge, Badge, Table, Th, Td, InfoBanner, Button } from "@/components/ui";
import { APPEALS, CANDIDATES } from "@/data/seed";
import { titleCase, userName, shortDate } from "@/lib/format";
import { Icon } from "@/components/Icon";

const TODAY = "2026-07-04";
const CATEGORIES = ["result", "technical", "center", "misconduct", "accommodation", "certificate"] as const;
const STATUSES = ["submitted", "in_review", "decided", "closed"] as const;

export default function AppealsPage() {
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  const rows = useMemo(() => APPEALS.filter((a) => {
    if (category !== "all" && a.category !== category) return false;
    if (status !== "all" && a.status !== status) return false;
    return true;
  }), [category, status]);

  const total = APPEALS.length;
  const inReview = APPEALS.filter((a) => a.status === "in_review").length;
  const decided = APPEALS.filter((a) => a.status === "decided").length;
  const breaches = APPEALS.filter((a) => a.slaDue < TODAY && (a.status === "submitted" || a.status === "in_review")).length;

  return (
    <div>
      <PageHeader
        title="Appeals & Complaints"
        subtitle="Candidate appeals against results, conduct, or service — tracked against a service-level agreement (SLA)."
        actions={<Button variant="secondary"><Icon name="gavel" className="w-4 h-4" />Submit appeal</Button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Kpi label="Total Appeals" value={total} tone="navy" />
        <Kpi label="In Review" value={inReview} tone="gold" />
        <Kpi label="Decided" value={decided} tone="green" />
        <Kpi label="SLA Breaches" value={breaches} tone="red" hint="Past due, not yet decided" />
      </div>

      <InfoBanner tone="blue">
        <span className="font-medium">SLA policy.</span> Appeals must be acknowledged within 2 business days and resolved within 10. Reviewers must never expose secure question content to candidates during the appeal process.
      </InfoBanner>

      <Card className="mt-5">
        <div className="flex flex-wrap items-center gap-2 p-4 border-b border-navy-100">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border border-navy-200 bg-white text-sm py-2 px-2.5">
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{titleCase(c)}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-navy-200 bg-white text-sm py-2 px-2.5">
            <option value="all">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}
          </select>
        </div>
        <Table>
          <thead>
            <tr>
              <Th>Appeal No.</Th><Th>Candidate</Th><Th>Category</Th><Th>Assigned to</Th><Th>SLA due</Th><Th>Status</Th><Th>Decision</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => {
              const cand = CANDIDATES.find((c) => c.id === a.candidateId);
              const overdue = a.slaDue < TODAY && (a.status === "submitted" || a.status === "in_review");
              return (
                <tr key={a.id} className="hover:bg-navy-50/60">
                  <Td><Link href={`/appeals/${a.id}`} className="font-mono text-[12px] font-medium text-teal-600 hover:underline">{a.appealNo}</Link></Td>
                  <Td className="text-navy-600">{cand ? cand.fullName : "—"}</Td>
                  <Td>{titleCase(a.category)}</Td>
                  <Td className="text-navy-600">{userName(a.assignedTo)}</Td>
                  <Td className="whitespace-nowrap">
                    <span className={overdue ? "text-rose-600 font-medium" : "text-navy-600"}>{shortDate(a.slaDue)}</span>
                    {overdue && <Badge tone="red">Overdue</Badge>}
                  </Td>
                  <Td><StatusBadge status={a.status} /></Td>
                  <Td className="text-xs text-navy-500 max-w-[220px]">{a.decision ?? "—"}</Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        <div className="px-4 py-3 text-xs text-navy-400">Showing {rows.length} of {total} appeals.</div>
      </Card>
    </div>
  );
}
