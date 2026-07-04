"use client";
import { notFound } from "next/navigation";
import { PageHeader, Card, CardHeader, Kpi, Badge, StatusBadge, RiskBadge, Table, Th, Td, InfoBanner, Button } from "@/components/ui";
import { BarChart } from "@/components/charts";
import { EXAM_FORMS, QUESTIONS, BLUEPRINTS } from "@/data/seed";
import { certName, certCode, titleCase, userName } from "@/lib/format";
import { useSession } from "@/lib/session";
import { can } from "@/lib/permissions";
import { Icon } from "@/components/Icon";

const RULES = [
  { label: "Randomised item order", met: true },
  { label: "Difficulty balance vs blueprint", met: true },
  { label: "Domain balance vs blueprint", met: true },
  { label: "Exposure / overlap rules", met: true },
  { label: "Language locked", met: true },
  { label: "Delivery method compatible", met: true },
];

export default function ExamFormDetailPage({ params }: { params: { id: string } }) {
  const { user } = useSession();
  const form = EXAM_FORMS.find((f) => f.id === params.id);
  if (!form) notFound();

  const locked = form.isLocked || ["approved", "locked"].includes(form.status);
  const blueprint = BLUEPRINTS.find((b) => b.id === form.blueprintId);
  const canReplace = can(user.roleKey, "approve_exam_form");

  const domainOf = (id: string) => QUESTIONS.find((q) => q.id === id)?.domain ?? "—";

  const def = (label: string, value: React.ReactNode) => (
    <div className="py-2.5 border-b border-navy-50 last:border-0">
      <dt className="text-[11px] uppercase tracking-wide text-navy-400">{label}</dt>
      <dd className="text-sm text-navy-800 mt-0.5">{value}</dd>
    </div>
  );

  return (
    <div>
      <PageHeader
        title={form.name}
        subtitle={`${certName(form.certificationId)} · ${certCode(form.certificationId)}`}
        actions={
          <>
            <StatusBadge status={form.status} />
            <RiskBadge level={form.leakageRisk} />
            <Button variant="secondary" href="/assembly"><Icon name="logout" className="w-4 h-4" />Back</Button>
          </>
        }
      />

      {locked && (
        <div className="mb-5">
          <InfoBanner tone="rose">
            <span className="inline-flex items-center gap-1.5 font-medium"><Icon name="lock" className="w-4 h-4" />Locked — editing disabled.</span>{" "}
            Approved forms lock automatically to preserve exam integrity. Any change requires a new version and full maker-checker re-approval.
          </InfoBanner>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Kpi label="Items" value={form.questionIds.length} tone="navy" />
        <Kpi label="Version" value={`v${form.version}`} tone="teal" />
        <Kpi label="Language" value={form.language.toUpperCase()} tone="gold" />
        <Kpi label="Leakage Risk" value={titleCase(form.leakageRisk)} tone={form.leakageRisk === "high" ? "red" : form.leakageRisk === "medium" ? "gold" : "green"} />
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        <Card>
          <CardHeader title="Form metadata" />
          <dl className="px-5 py-2">
            {def("Certification", certName(form.certificationId))}
            {def("Blueprint", blueprint ? <Button variant="ghost" href={`/blueprints/${blueprint.id}`} className="px-0 py-0 h-auto"><Icon name="blueprint" className="w-4 h-4" />{blueprint.id}</Button> : form.blueprintId)}
            {def("Status", <StatusBadge status={form.status} />)}
            {def("Created by", userName(form.createdBy))}
            {def("Approved by", form.approvedBy ? userName(form.approvedBy) : "Pending approval")}
          </dl>
        </Card>
        <Card>
          <CardHeader title="Domain balance" subtitle="Items drawn per domain" />
          <div className="p-5">
            <BarChart data={form.domainBalance.map((d) => ({ label: d.domain, value: d.count }))} />
          </div>
        </Card>
      </div>

      <Card className="mb-5">
        <CardHeader title="Assembly rules honoured" subtitle="Automated checks run at generation time" />
        <div className="flex flex-wrap gap-2 p-5">
          {RULES.map((r) => (
            <Badge key={r.label} tone={r.met ? "green" : "red"}>
              <Icon name={r.met ? "check" : "x"} className="w-3 h-3 mr-1" />{r.label}
            </Badge>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Secure form preview"
          subtitle={`${form.questionIds.length} items — IDs and domains only`}
          action={
            canReplace ? (
              <Button variant="danger" disabled={false}><Icon name="alert" className="w-4 h-4" />Emergency replace item</Button>
            ) : (
              <span title="Requires 'Approve exam form' permission and follows maker-checker.">
                <Button variant="secondary" disabled><Icon name="lock" className="w-4 h-4" />Emergency replace item</Button>
              </span>
            )
          }
        />
        <div className="p-5 pb-0">
          <InfoBanner tone="amber">
            <span className="font-medium">Secure preview.</span> Answer keys and question stems are never exposed in form preview — only item IDs and their domain are shown. Full content is available in the question bank to authorised content roles, and every access is audited.
          </InfoBanner>
        </div>
        <Table>
          <thead>
            <tr><Th className="w-12">#</Th><Th>Item ID</Th><Th>Domain</Th><Th>Answer key</Th></tr>
          </thead>
          <tbody>
            {form.questionIds.map((qid, i) => (
              <tr key={qid}>
                <Td className="text-navy-400 tabular-nums">{i + 1}</Td>
                <Td className="font-mono text-[13px] text-navy-700">{qid}</Td>
                <Td className="text-navy-600">{domainOf(qid)}</Td>
                <Td><Badge tone="gray"><Icon name="lock" className="w-3 h-3 mr-1" />Sealed</Badge></Td>
              </tr>
            ))}
          </tbody>
        </Table>
        <div className="px-5 py-3 text-xs text-navy-400">
          {locked
            ? "Item substitution is disabled on locked forms. An emergency replacement of a compromised item requires approver action and generates a new form version under maker-checker."
            : "Emergency replacement of a compromised item is available to approvers only and follows maker-checker: the replacement is proposed by one officer and confirmed by another."}
        </div>
      </Card>
    </div>
  );
}
