"use client";
import {
  Card, CardHeader, Kpi, PageHeader, Badge, StatusBadge, RiskBadge,
  Table, Th, Td, Button, Restricted, InfoBanner,
} from "@/components/ui";
import { Meter } from "@/components/charts";
import { Icon } from "@/components/Icon";
import {
  QUESTIONS, SECURITY_ALERTS, ATTEMPTS, EXAM_FORMS, USERS, SESSIONS,
} from "@/data/seed";
import { certCode, userName, dateTime, titleCase } from "@/lib/format";
import { useSession } from "@/lib/session";
import { can } from "@/lib/permissions";

const ACCESS_CONTROLS: { title: string; detail: string }[] = [
  { title: "Role-based access control (RBAC)", detail: "Granular permissions map every role to the minimum data it needs." },
  { title: "Multi-factor authentication (placeholder)", detail: "MFA enforced for privileged roles; status tracked per user." },
  { title: "Encryption of sensitive content", detail: "Question stems, answer keys, and PII encrypted at rest and in transit." },
  { title: "Dynamic watermarking", detail: "Secure content is watermarked with viewer identity and timestamp." },
  { title: "Question access logging", detail: "Every stem/answer view is written to the immutable audit trail." },
  { title: "Export approval workflow", detail: "Sensitive exports require maker-checker approval before release." },
  { title: "Segregation of duties (SoD)", detail: "Authors cannot approve their own work; makers cannot be checkers." },
  { title: "Maker-checker controls", detail: "Question, form, and result changes require independent verification." },
  { title: "Emergency question suspension", detail: "Compromised items can be suspended across all forms instantly." },
  { title: "Immutable audit trail", detail: "All privileged actions logged with user, IP, device, and risk level." },
];

export default function SecurityCenter() {
  const { user } = useSession();

  if (!can(user.roleKey, "view_security")) {
    return (
      <div>
        <PageHeader title="Security Center" subtitle="Exam-integrity monitoring, question exposure, and access controls." />
        <Restricted message="The Security Center requires the view_security permission. Contact an administrator if you believe you should have access." />
      </div>
    );
  }

  const openAlerts = SECURITY_ALERTS.filter((a) => a.status === "open");
  const criticalAlerts = SECURITY_ALERTS.filter((a) => a.severity === "critical");
  const overExposed = QUESTIONS.filter((q) => q.usageCount > q.exposureLimit);
  const compromised = QUESTIONS.filter((q) => q.status === "compromised" || q.status === "suspended");
  const flaggedAttempts = ATTEMPTS.filter((a) => a.flags.length > 0);
  const behaviorAlerts = SECURITY_ALERTS.filter((a) => a.type === "behavior");
  const passRateAlerts = SECURITY_ALERTS.filter((a) => a.type === "pass_rate");
  const leakyForms = EXAM_FORMS.filter((f) => f.leakageRisk === "high" || f.leakageRisk === "medium");
  const underInvestigation = SESSIONS.filter((s) => s.status === "under_investigation");

  return (
    <div>
      <PageHeader
        title="Security Center"
        subtitle={`Exam-integrity monitoring, question exposure, and access controls. Signed in as ${user.fullName}.`}
        actions={<Button variant="secondary"><Icon name="shield" className="w-4 h-4" /> Security posture: Elevated</Button>}
      />

      <div className="mb-4">
        <InfoBanner tone="amber">
          <span className="font-semibold">Segregation of Duties enforced:</span> authors cannot approve their own questions,
          makers cannot act as checkers, exports require independent approval, and result changes are dual-controlled.
          Sensitive actions are watermarked and written to the immutable audit trail.
        </InfoBanner>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 mb-6">
        <Kpi label="Open Alerts" value={openAlerts.length} tone={openAlerts.length ? "red" : "green"} />
        <Kpi label="Critical Alerts" value={criticalAlerts.length} tone={criticalAlerts.length ? "red" : "green"} />
        <Kpi label="Over Exposure Limit" value={overExposed.length} tone="gold" hint="questions" />
        <Kpi label="Compromised Questions" value={compromised.length} tone="red" />
        <Kpi label="Sessions Under Investigation" value={underInvestigation.length} tone={underInvestigation.length ? "red" : "green"} />
      </div>

      {/* Security & Integrity Alerts */}
      <Card className="mb-4">
        <CardHeader title="Security & Integrity Alerts" subtitle={`${openAlerts.length} open · ${SECURITY_ALERTS.length} total`} />
        <Table>
          <thead><tr><Th>Type</Th><Th>Severity</Th><Th>Subject</Th><Th>Message</Th><Th>Status</Th><Th className="text-right">Actions</Th></tr></thead>
          <tbody>
            {SECURITY_ALERTS.map((a) => (
              <tr key={a.id}>
                <Td><Badge tone="blue">{titleCase(a.type)}</Badge></Td>
                <Td><RiskBadge level={a.severity} /></Td>
                <Td className="font-mono text-xs">{a.subjectId}</Td>
                <Td className="text-navy-700 max-w-md">{a.message}</Td>
                <Td><StatusBadge status={a.status} /></Td>
                <Td className="text-right">
                  <div className="inline-flex gap-1.5">
                    <Button variant="ghost" className="text-xs">Acknowledge</Button>
                    <Button variant="secondary" className="text-xs">Resolve</Button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Question Exposure Monitoring */}
        <Card>
          <CardHeader title="Question Exposure Monitoring" subtitle="Items exceeding their exposure limit — retirement advised" />
          <Table>
            <thead><tr><Th>Question ID</Th><Th>Certification</Th><Th>Usage vs Limit</Th><Th>Advisory</Th></tr></thead>
            <tbody>
              {overExposed.length === 0 && <tr><Td>No items over exposure limit.</Td></tr>}
              {overExposed.map((q) => (
                <tr key={q.id}>
                  <Td className="font-mono text-xs text-navy-800">{q.id}</Td>
                  <Td>{certCode(q.certificationId)}</Td>
                  <Td>
                    <div className="w-32">
                      <Meter value={(q.usageCount / q.exposureLimit) * 100} tone="red" label={`${q.usageCount}/${q.exposureLimit}`} />
                    </div>
                  </Td>
                  <Td><Badge tone="red">Recommend retirement</Badge></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        {/* Compromised Question Workflow */}
        <Card>
          <CardHeader title="Compromised Question Workflow" subtitle="Emergency suspension under maker-checker control" />
          <div className="px-5 pt-4">
            <InfoBanner tone="rose">
              Emergency suspend removes an item from all forms immediately. The action is proposed by one officer (maker)
              and confirmed by a second (checker), then logged to the audit trail.
            </InfoBanner>
          </div>
          <Table>
            <thead><tr><Th>Question ID</Th><Th>Certification</Th><Th>Status</Th><Th className="text-right">Action</Th></tr></thead>
            <tbody>
              {compromised.length === 0 && <tr><Td>No compromised or suspended items.</Td></tr>}
              {compromised.map((q) => (
                <tr key={q.id}>
                  <Td className="font-mono text-xs text-navy-800">{q.id}</Td>
                  <Td>{certCode(q.certificationId)}</Td>
                  <Td><StatusBadge status={q.status} /></Td>
                  <Td className="text-right"><Button variant="danger" className="text-xs">Emergency suspend</Button></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Suspicious Candidate Behavior */}
        <Card>
          <CardHeader title="Suspicious Candidate Behavior" subtitle="Flagged live attempts and behavior alerts" />
          <Table>
            <thead><tr><Th>Reference</Th><Th>Detail</Th><Th>Severity</Th><Th>Status</Th></tr></thead>
            <tbody>
              {behaviorAlerts.map((a) => (
                <tr key={a.id}>
                  <Td className="font-mono text-xs">{a.subjectId}</Td>
                  <Td className="text-navy-700">{a.message}</Td>
                  <Td><RiskBadge level={a.severity} /></Td>
                  <Td><StatusBadge status={a.status} /></Td>
                </tr>
              ))}
              {flaggedAttempts.map((a) => (
                <tr key={a.id}>
                  <Td className="font-mono text-xs">{a.seat} · {a.candidateId}</Td>
                  <Td className="text-navy-700">{a.flags.join(", ")}</Td>
                  <Td><RiskBadge level="medium" /></Td>
                  <Td><StatusBadge status={a.loginStatus} /></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        {/* Exam Form Leakage Risk */}
        <Card>
          <CardHeader title="Exam Form Leakage Risk" subtitle="Forms carrying medium or high leakage indicators" />
          <Table>
            <thead><tr><Th>Form</Th><Th>Certification</Th><Th>Items</Th><Th>Leakage Risk</Th><Th>Status</Th></tr></thead>
            <tbody>
              {leakyForms.length === 0 && <tr><Td>No elevated-risk forms.</Td></tr>}
              {leakyForms.map((f) => (
                <tr key={f.id}>
                  <Td className="font-medium text-navy-800">{f.name}</Td>
                  <Td>{certCode(f.certificationId)}</Td>
                  <Td className="tabular-nums">{f.questionIds.length}</Td>
                  <Td><RiskBadge level={f.leakageRisk} /></Td>
                  <Td><StatusBadge status={f.status} /></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>

      {/* Unusual Pass-rate Alerts */}
      <Card className="mb-4">
        <CardHeader title="Unusual Pass-rate Alerts" subtitle="Statistical spikes that may indicate content leakage" />
        <Table>
          <thead><tr><Th>Subject</Th><Th>Message</Th><Th>Severity</Th><Th>Status</Th></tr></thead>
          <tbody>
            {passRateAlerts.length === 0 && <tr><Td>No pass-rate anomalies.</Td></tr>}
            {passRateAlerts.map((a) => (
              <tr key={a.id}>
                <Td className="font-mono text-xs">{a.subjectId}</Td>
                <Td className="text-navy-700">{a.message}</Td>
                <Td><RiskBadge level={a.severity} /></Td>
                <Td><StatusBadge status={a.status} /></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Access controls panel */}
        <Card>
          <CardHeader title="Access Controls" subtitle="Implemented platform security controls" />
          <ul className="p-5 space-y-3">
            {ACCESS_CONTROLS.map((c) => (
              <li key={c.title} className="flex gap-3">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-teal-50 text-teal-600 grid place-items-center shrink-0">
                  <Icon name="check" className="w-3.5 h-3.5" />
                </span>
                <div>
                  <p className="text-sm font-medium text-navy-800">{c.title}</p>
                  <p className="text-xs text-navy-400">{c.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        {/* User Access Review */}
        <Card>
          <CardHeader title="User Access Review" subtitle="Periodic review of roles, MFA, and last activity" />
          <Table>
            <thead><tr><Th>User</Th><Th>Role</Th><Th>MFA</Th><Th>Last Login</Th><Th className="text-right">Review</Th></tr></thead>
            <tbody>
              {USERS.map((u) => (
                <tr key={u.id}>
                  <Td className="font-medium text-navy-800">{u.fullName}</Td>
                  <Td>{titleCase(u.roleKey)}</Td>
                  <Td><Badge tone={u.mfaEnabled ? "green" : "red"}>{u.mfaEnabled ? "Enabled" : "Disabled"}</Badge></Td>
                  <Td className="text-navy-500">{dateTime(u.lastLoginAt)}</Td>
                  <Td className="text-right"><Button variant="ghost" className="text-xs">Review</Button></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
