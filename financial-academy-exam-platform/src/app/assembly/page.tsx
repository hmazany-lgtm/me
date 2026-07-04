"use client";
import Link from "next/link";
import { PageHeader, Card, Kpi, StatusBadge, Badge, RiskBadge, Table, Th, Td, Button } from "@/components/ui";
import { EXAM_FORMS } from "@/data/seed";
import { certName, certCode } from "@/lib/format";
import { useSession } from "@/lib/session";
import { can } from "@/lib/permissions";
import { Icon } from "@/components/Icon";

export default function AssemblyPage() {
  const { user } = useSession();
  const canGenerate = can(user.roleKey, "generate_exam_form");

  const counts = {
    total: EXAM_FORMS.length,
    approved: EXAM_FORMS.filter((f) => ["approved", "locked"].includes(f.status)).length,
    locked: EXAM_FORMS.filter((f) => f.isLocked).length,
    highRisk: EXAM_FORMS.filter((f) => f.leakageRisk === "high").length,
  };

  return (
    <div>
      <PageHeader
        title="Exam Assembly"
        subtitle="Blueprint-driven exam forms — assembled, balanced, and locked under maker-checker control."
        actions={
          canGenerate ? (
            <Button variant="secondary"><Icon name="assembly" className="w-4 h-4" />Generate new form</Button>
          ) : (
            <span title="Requires the 'Generate exam form' permission (exam operations / certification manager).">
              <Button variant="secondary" disabled><Icon name="lock" className="w-4 h-4" />Generate new form</Button>
            </span>
          )
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Kpi label="Total Forms" value={counts.total} tone="navy" />
        <Kpi label="Approved" value={counts.approved} tone="green" />
        <Kpi label="Locked" value={counts.locked} tone="teal" hint="Editing disabled" />
        <Kpi label="High Leakage Risk" value={counts.highRisk} tone="red" />
      </div>

      <Card>
        <div className="flex items-center gap-2 p-4 border-b border-navy-100 text-sm font-medium text-navy-700">
          <Icon name="assembly" className="w-4 h-4 text-teal-600" /> Assembled exam forms
        </div>
        <Table>
          <thead>
            <tr>
              <Th>Form</Th>
              <Th>Certification</Th>
              <Th>Language</Th>
              <Th className="text-right">Version</Th>
              <Th>Status</Th>
              <Th>Lock</Th>
              <Th>Leakage Risk</Th>
            </tr>
          </thead>
          <tbody>
            {EXAM_FORMS.map((f) => (
              <tr key={f.id} className="hover:bg-navy-50/60">
                <Td>
                  <Link href={`/assembly/${f.id}`} className="font-medium text-teal-600 hover:underline">{f.name}</Link>
                  <div className="text-[11px] text-navy-400">{f.questionIds.length} items</div>
                </Td>
                <Td className="text-navy-600">{certName(f.certificationId)}<div className="text-[11px] text-navy-400 font-mono">{certCode(f.certificationId)}</div></Td>
                <Td>{f.language.toUpperCase()}</Td>
                <Td className="text-right tabular-nums">v{f.version}</Td>
                <Td><StatusBadge status={f.status} /></Td>
                <Td>{f.isLocked ? <Badge tone="purple"><Icon name="lock" className="w-3 h-3 mr-1" />Locked</Badge> : <span className="text-navy-300 text-xs">—</span>}</Td>
                <Td><RiskBadge level={f.leakageRisk} /></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
