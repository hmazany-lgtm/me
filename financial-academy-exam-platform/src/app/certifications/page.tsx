"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader, Card, Kpi, StatusBadge, Table, Th, Td, Badge } from "@/components/ui";
import { CERTIFICATIONS } from "@/data/seed";
import { sar, pct, titleCase } from "@/lib/format";
import { Icon } from "@/components/Icon";

const CERT_STATUSES = ["draft", "active", "suspended", "retired"] as const;

export default function CertificationsPage() {
  const [status, setStatus] = useState("all");

  const rows = useMemo(
    () => CERTIFICATIONS.filter((c) => status === "all" || c.status === status),
    [status]
  );

  const counts = {
    total: CERTIFICATIONS.length,
    active: CERTIFICATIONS.filter((c) => c.status === "active").length,
    draft: CERTIFICATIONS.filter((c) => c.status === "draft").length,
    inactive: CERTIFICATIONS.filter((c) => ["suspended", "retired"].includes(c.status)).length,
  };

  return (
    <div>
      <PageHeader
        title="Certifications & Exam Products"
        subtitle="The Financial Academy's regulated certification portfolio — ownership, health, and commercial performance at a glance."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Kpi label="Total Products" value={counts.total} tone="navy" />
        <Kpi label="Active" value={counts.active} tone="green" hint="Available for delivery" />
        <Kpi label="In Draft" value={counts.draft} tone="gold" hint="Pending governance approval" />
        <Kpi label="Suspended / Retired" value={counts.inactive} tone="red" hint="Withdrawn from delivery" />
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2 p-4 border-b border-navy-100">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-navy-700">
            <Icon name="certificate" className="w-4 h-4 text-teal-600" /> Certification catalogue
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-navy-200 bg-white text-sm py-2 px-2.5"
          >
            <option value="all">All statuses</option>
            {CERT_STATUSES.map((s) => (
              <option key={s} value={s}>{titleCase(s)}</option>
            ))}
          </select>
        </div>
        <Table>
          <thead>
            <tr>
              <Th>Code</Th>
              <Th>Certification</Th>
              <Th>Regulator / Owner</Th>
              <Th>Status</Th>
              <Th className="text-right">Pass Score</Th>
              <Th className="text-right">Items</Th>
              <Th className="text-right">Candidates</Th>
              <Th className="text-right">Pass Rate</Th>
              <Th className="text-right">Revenue</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="hover:bg-navy-50/60">
                <Td>
                  <Link href={`/certifications/${c.id}`} className="font-mono text-[13px] font-medium text-teal-600 hover:underline">
                    {c.code}
                  </Link>
                </Td>
                <Td>
                  <Link href={`/certifications/${c.id}`} className="font-medium text-navy-800 hover:underline">
                    {c.name}
                  </Link>
                  <div className="text-[11px] text-navy-400">v{c.version} · {c.durationMinutes} min</div>
                </Td>
                <Td className="text-navy-600">{c.regulatorOwner}</Td>
                <Td><StatusBadge status={c.status} /></Td>
                <Td className="text-right tabular-nums">{c.passingScore}%</Td>
                <Td className="text-right tabular-nums">{c.questionCount}</Td>
                <Td className="text-right tabular-nums">{c.stats.candidates}</Td>
                <Td className="text-right">
                  <Badge tone={c.stats.passRate >= 70 ? "green" : c.stats.passRate >= 50 ? "amber" : c.stats.candidates ? "red" : "gray"}>
                    {c.stats.candidates ? pct(c.stats.passRate) : "—"}
                  </Badge>
                </Td>
                <Td className="text-right tabular-nums text-navy-700">{sar(c.stats.revenue)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
        <div className="px-4 py-3 text-xs text-navy-400">Showing {rows.length} of {CERTIFICATIONS.length} certifications.</div>
      </Card>
    </div>
  );
}
