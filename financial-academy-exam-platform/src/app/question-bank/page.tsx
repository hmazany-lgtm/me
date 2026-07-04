"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader, Card, CardHeader, Kpi, Badge, StatusBadge, Table, Th, Td, InfoBanner, Button } from "@/components/ui";
import { Meter } from "@/components/charts";
import { QUESTIONS, CERTIFICATIONS } from "@/data/seed";
import { certCode, titleCase } from "@/lib/format";
import { useSession } from "@/lib/session";
import { can } from "@/lib/permissions";
import { computeBankHealth, itemFlags } from "@/lib/analytics";
import { Icon } from "@/components/Icon";

export default function QuestionBankPage() {
  const { user } = useSession();
  const [cert, setCert] = useState("all");
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");

  const canView = can(user.roleKey, "view_question");

  const rows = useMemo(() => QUESTIONS.filter((item) => {
    if (cert !== "all" && item.certificationId !== cert) return false;
    if (status !== "all" && item.status !== status) return false;
    if (q && !item.id.toLowerCase().includes(q.toLowerCase()) && !item.domain.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [cert, status, q]);

  const health = computeBankHealth(QUESTIONS, cert === "all" ? undefined : cert);

  if (!canView) {
    return (
      <div>
        <PageHeader title="Question Bank" subtitle="Secure repository of certification items." />
        <InfoBanner tone="rose">Your role ({titleCase(user.roleKey)}) has no access to question-bank content. Invigilators, candidates, executives and vendors are intentionally excluded under segregation-of-duties rules.</InfoBanner>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Secure Question Bank"
        subtitle="Access to items is logged. Correct answers are masked unless you hold the required permission."
        actions={
          <>
            <Button variant="secondary"><Icon name="search" className="w-4 h-4" />Similarity check</Button>
            <Button variant="secondary"><Icon name="lock" className="w-4 h-4" />Request export</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        <Kpi label="Total Items" value={QUESTIONS.length} tone="navy" />
        <Kpi label="Active" value={QUESTIONS.filter((x) => x.status === "active").length} tone="green" />
        <Kpi label="Under Review" value={QUESTIONS.filter((x) => x.status === "under_review").length} tone="gold" />
        <Kpi label="Compromised / Suspended" value={QUESTIONS.filter((x) => ["compromised", "suspended"].includes(x.status)).length} tone="red" />
        <Kpi label="Bank Health" value={`${health.score}`} hint={health.band} tone={health.score >= 75 ? "green" : "gold"} />
      </div>

      <InfoBanner tone="amber">
        <span className="font-medium">Security notice.</span> Every view of an item, and every reveal of a correct answer, creates an audit and question-access record with your name, email, IP and timestamp. Bulk export of live items requires maker-checker approval.
      </InfoBanner>

      <Card className="mt-5">
        <div className="flex flex-wrap items-center gap-2 p-4 border-b border-navy-100">
          <div className="relative flex-1 min-w-[200px]">
            <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-navy-300" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by ID or domain…" className="w-full rounded-lg bg-navy-50 border border-navy-100 pl-9 pr-3 py-2 text-sm" />
          </div>
          <select value={cert} onChange={(e) => setCert(e.target.value)} className="rounded-lg border border-navy-200 bg-white text-sm py-2 px-2.5">
            <option value="all">All certifications</option>
            {CERTIFICATIONS.map((c) => <option key={c.id} value={c.id}>{c.code}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-navy-200 bg-white text-sm py-2 px-2.5">
            <option value="all">All statuses</option>
            {["draft", "under_review", "approved", "active", "suspended", "retired", "compromised"].map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}
          </select>
        </div>
        <Table>
          <thead>
            <tr>
              <Th>Item ID</Th><Th>Certification</Th><Th>Domain</Th><Th>Type</Th><Th>Difficulty</Th><Th>Disc. index</Th><Th>Exposure</Th><Th>Status</Th><Th>Signals</Th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 40).map((item) => {
              const flags = itemFlags(item);
              return (
                <tr key={item.id} className="hover:bg-navy-50/60">
                  <Td><Link href={`/question-bank/${item.id}`} className="font-mono text-[13px] font-medium text-teal-600 hover:underline">{item.id}</Link></Td>
                  <Td>{certCode(item.certificationId)}</Td>
                  <Td className="text-navy-600">{item.domain}</Td>
                  <Td>{titleCase(item.type)}</Td>
                  <Td><Badge tone={item.difficulty === "hard" ? "red" : item.difficulty === "medium" ? "amber" : "green"}>{titleCase(item.difficulty)}</Badge></Td>
                  <Td className={`tabular-nums ${item.discriminationIndex < 0.15 ? "text-rose-600 font-medium" : "text-navy-600"}`}>{item.discriminationIndex.toFixed(2)}</Td>
                  <Td className="w-28"><Meter value={(item.usageCount / item.exposureLimit) * 100} tone={item.usageCount > item.exposureLimit ? "red" : "teal"} /></Td>
                  <Td><StatusBadge status={item.status} /></Td>
                  <Td>{flags.slice(0, 1).map((f) => <Badge key={f.label} tone={f.tone}>{f.label}</Badge>)}</Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        <div className="px-4 py-3 text-xs text-navy-400">Showing {Math.min(40, rows.length)} of {rows.length} items.</div>
      </Card>
    </div>
  );
}
