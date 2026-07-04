"use client";
import { useState } from "react";
import Link from "next/link";
import { PageHeader, Card, CardHeader, Kpi, Badge, StatusBadge, Button, InfoBanner, Table, Th, Td } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { RESULTS, CANDIDATES, CERTIFICATIONS } from "@/data/seed";
import { certName } from "@/lib/format";
import { useSession } from "@/lib/session";
import { can } from "@/lib/permissions";
import type { ResultStatus } from "@/lib/types";

const STATUSES: ResultStatus[] = ["pending", "approved", "held", "released", "invalidated"];

export default function ResultsPage() {
  const { user } = useSession();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [certFilter, setCertFilter] = useState<string>("all");

  const mayRelease = can(user.roleKey, "release_result");

  const filtered = RESULTS.filter(
    (r) => (statusFilter === "all" || r.status === statusFilter) && (certFilter === "all" || r.certificationId === certFilter)
  );

  const released = RESULTS.filter((r) => r.status === "released").length;
  const pendingHeld = RESULTS.filter((r) => r.status === "pending" || r.status === "held").length;
  const passRate = RESULTS.length ? Math.round((RESULTS.filter((r) => r.passed).length / RESULTS.length) * 100) : 0;

  return (
    <div>
      <PageHeader
        title="Scoring & Results"
        subtitle="Scaled scores, pass/fail outcomes and maker-checker result release"
        actions={
          mayRelease ? (
            <Button variant="primary"><Icon name="check" className="w-4 h-4" />Release results</Button>
          ) : (
            <Button variant="primary" disabled title="Requires release_result permission"><Icon name="lock" className="w-4 h-4" />Release results</Button>
          )
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Kpi label="Total results" value={RESULTS.length} tone="navy" />
        <Kpi label="Released" value={released} tone="green" hint="Visible to candidates" />
        <Kpi label="Pending / held" value={pendingHeld} tone="gold" hint="Awaiting approval" />
        <Kpi label="Pass rate" value={`${passRate}%`} tone="teal" hint="Across all results" />
      </div>

      <InfoBanner tone="amber">
        <span className="font-medium">Release control:</span> results are <span className="font-semibold">not visible to the candidate until status is &ldquo;released&rdquo;</span>. Release is a maker-checker action — it records the approving officer and is written to the audit trail. {mayRelease ? "You are authorized to release results." : "Your role can view but not release results."}
      </InfoBanner>

      <Card className="mt-4">
        <CardHeader
          title="Result register"
          subtitle={`${filtered.length} of ${RESULTS.length} results`}
          action={
            <div className="flex items-center gap-2">
              <select value={certFilter} onChange={(e) => setCertFilter(e.target.value)} className="rounded-lg border border-navy-200 bg-white px-2.5 py-1.5 text-xs text-navy-700">
                <option value="all">All certifications</option>
                {CERTIFICATIONS.map((c) => <option key={c.id} value={c.id}>{c.code}</option>)}
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-navy-200 bg-white px-2.5 py-1.5 text-xs text-navy-700">
                <option value="all">All statuses</option>
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
              </select>
            </div>
          }
        />
        <Table>
          <thead>
            <tr>
              <Th>Candidate</Th>
              <Th>Certification</Th>
              <Th className="text-right">Raw</Th>
              <Th className="text-right">Scaled</Th>
              <Th className="text-right">Passing</Th>
              <Th>Outcome</Th>
              <Th>Status</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const cand = CANDIDATES.find((c) => c.id === r.candidateId);
              const dim = r.status === "held" || r.status === "invalidated";
              return (
                <tr key={r.id} className={dim ? "bg-navy-50/60" : ""}>
                  <Td className={`font-medium ${dim ? "text-navy-400" : "text-navy-800"}`}>
                    {cand?.fullName ?? r.candidateId}
                    {r.status === "invalidated" && <Badge tone="red">Invalidated</Badge>}
                    {r.status === "held" && <Badge tone="amber">Held</Badge>}
                  </Td>
                  <Td className="text-navy-600">{certName(r.certificationId)}</Td>
                  <Td className="text-right tabular-nums">{r.rawScore}</Td>
                  <Td className="text-right tabular-nums font-semibold">{r.scaledScore}</Td>
                  <Td className="text-right tabular-nums text-navy-400">{r.passingScore}</Td>
                  <Td><StatusBadge status={r.passed ? "passed" : "failed"} /></Td>
                  <Td><StatusBadge status={r.status} /></Td>
                  <Td className="text-right">
                    <Link href={`/results/${r.id}`} className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-700 text-xs font-medium">
                      View report<Icon name="eye" className="w-3.5 h-3.5" />
                    </Link>
                  </Td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><Td className="text-center text-navy-400 py-8">No results match the selected filters.</Td></tr>
            )}
          </tbody>
        </Table>
      </Card>

      <p className="text-[11px] text-navy-400 mt-3">
        Held and invalidated rows are visually de-emphasised — they are excluded from candidate view and certificate issuance until a governance decision is recorded.
      </p>
    </div>
  );
}
