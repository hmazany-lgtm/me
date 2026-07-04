"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader, Card, Kpi, StatusBadge, Table, Th, Td, Button, Restricted, InfoBanner } from "@/components/ui";
import { CANDIDATES } from "@/data/seed";
import { certCode, certName, mask } from "@/lib/format";
import { useSession } from "@/lib/session";
import { can, canFull } from "@/lib/permissions";
import { Icon } from "@/components/Icon";

export default function CandidatesPage() {
  const { user } = useSession();
  const [q, setQ] = useState("");

  const mayView = can(user.roleKey, "view_candidate");
  const full = canFull(user.roleKey, "view_candidate");

  const rows = useMemo(() => CANDIDATES.filter((c) => {
    if (!q) return true;
    const t = q.toLowerCase();
    return c.fullName.toLowerCase().includes(t) || c.employer.toLowerCase().includes(t);
  }), [q]);

  if (!mayView) {
    return (
      <div>
        <PageHeader title="Candidate Management" subtitle="Candidate lifecycle, eligibility and payment." />
        <Restricted message="Your role cannot view candidate records. Candidate PII is restricted under data-protection and segregation-of-duties rules." />
      </div>
    );
  }

  const total = CANDIDATES.length;
  const eligible = CANDIDATES.filter((c) => c.eligibilityStatus === "eligible").length;
  const pendingPay = CANDIDATES.filter((c) => c.paymentStatus === "pending").length;
  const withAccom = CANDIDATES.filter((c) => c.accommodations.length > 0).length;

  return (
    <div>
      <PageHeader
        title="Candidate Management"
        subtitle="Registration, eligibility, payment and accommodations across all certifications."
        actions={
          <>
            <Button variant="secondary"><Icon name="log" className="w-4 h-4" />Bulk upload</Button>
            <Button variant="secondary"><Icon name="users" className="w-4 h-4" />Register candidate</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Kpi label="Total Candidates" value={total} tone="navy" />
        <Kpi label="Eligible" value={eligible} tone="green" />
        <Kpi label="Pending Payment" value={pendingPay} tone="gold" />
        <Kpi label="With Accommodations" value={withAccom} tone="teal" />
      </div>

      {!full && (
        <InfoBanner tone="amber">
          <span className="font-medium">Masked view.</span> Your role sees candidate identifiers in masked form only. National IDs and email addresses are hidden to protect personal data.
        </InfoBanner>
      )}

      <Card className="mt-5">
        <div className="flex flex-wrap items-center gap-2 p-4 border-b border-navy-100">
          <div className="relative flex-1 min-w-[200px]">
            <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-navy-300" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or employer…" className="w-full rounded-lg bg-navy-50 border border-navy-100 pl-9 pr-3 py-2 text-sm" />
          </div>
        </div>
        <Table>
          <thead>
            <tr>
              <Th>Candidate</Th><Th>National ID</Th><Th>Email</Th><Th>Employer</Th><Th>Sector</Th><Th>City</Th><Th>Certification</Th><Th className="text-right">Attempts</Th><Th>Eligibility</Th><Th>Payment</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="hover:bg-navy-50/60">
                <Td><Link href={`/candidates/${c.id}`} className="font-medium text-teal-600 hover:underline">{c.fullName}</Link></Td>
                <Td className="font-mono text-[12px] text-navy-500">{full ? c.nationalId : mask(c.nationalId)}</Td>
                <Td className="text-navy-500 text-[13px]">{full ? c.email : mask(c.email, 0)}</Td>
                <Td className="text-navy-600">{c.employer}</Td>
                <Td>{c.sector}</Td>
                <Td>{c.city}</Td>
                <Td><span title={certName(c.certificationId)}>{certCode(c.certificationId)}</span></Td>
                <Td className="text-right tabular-nums">{c.attempts}</Td>
                <Td><StatusBadge status={c.eligibilityStatus} /></Td>
                <Td><StatusBadge status={c.paymentStatus} /></Td>
              </tr>
            ))}
          </tbody>
        </Table>
        <div className="px-4 py-3 text-xs text-navy-400">Showing {rows.length} of {total} candidates.</div>
      </Card>
    </div>
  );
}
