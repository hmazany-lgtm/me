"use client";
import Link from "next/link";
import { PageHeader, Card, Kpi, StatusBadge, Badge, Table, Th, Td } from "@/components/ui";
import { BLUEPRINTS } from "@/data/seed";
import { certName, certCode, num } from "@/lib/format";
import { blueprintReadiness } from "@/lib/analytics";
import { Icon } from "@/components/Icon";

const READINESS_LABEL: Record<string, string> = { green: "Ready", amber: "At risk", red: "Not ready" };

export default function BlueprintsPage() {
  const rows = BLUEPRINTS.map((bp) => ({ bp, readiness: blueprintReadiness(bp) }));

  const counts = {
    total: BLUEPRINTS.length,
    approved: BLUEPRINTS.filter((b) => b.status === "approved").length,
    draft: BLUEPRINTS.filter((b) => b.status === "draft").length,
    needing: rows.filter((r) => r.readiness.overall !== "green").length,
  };

  return (
    <div>
      <PageHeader
        title="Exam Blueprints"
        subtitle="Domain weighting, difficulty and cognitive targets, and question-supply readiness for every certification."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Kpi label="Total Blueprints" value={counts.total} tone="navy" />
        <Kpi label="Approved" value={counts.approved} tone="green" />
        <Kpi label="In Draft" value={counts.draft} tone="gold" />
        <Kpi label="Needing Questions" value={counts.needing} tone="red" hint="Amber or red readiness" />
      </div>

      <Card>
        <div className="flex items-center gap-2 p-4 border-b border-navy-100 text-sm font-medium text-navy-700">
          <Icon name="blueprint" className="w-4 h-4 text-teal-600" /> Blueprint register
        </div>
        <Table>
          <thead>
            <tr>
              <Th>Certification</Th>
              <Th className="text-right">Version</Th>
              <Th>Status</Th>
              <Th className="text-right">Total Items</Th>
              <Th className="text-right">Domains</Th>
              <Th>Readiness</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ bp, readiness }) => (
              <tr key={bp.id} className="hover:bg-navy-50/60">
                <Td>
                  <Link href={`/blueprints/${bp.id}`} className="font-medium text-navy-800 hover:underline">
                    {certName(bp.certificationId)}
                  </Link>
                  <div className="text-[11px] text-navy-400 font-mono">{certCode(bp.certificationId)}</div>
                </Td>
                <Td className="text-right tabular-nums">v{bp.version}</Td>
                <Td><StatusBadge status={bp.status} /></Td>
                <Td className="text-right tabular-nums">{num(bp.totalQuestions)}</Td>
                <Td className="text-right tabular-nums">{bp.domains.length}</Td>
                <Td><Badge tone={readiness.overall}>{READINESS_LABEL[readiness.overall]}</Badge></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
