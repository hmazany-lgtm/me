"use client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader, Card, CardHeader, Badge, StatusBadge, RiskBadge, Button, InfoBanner } from "@/components/ui";
import { INCIDENTS, CANDIDATES } from "@/data/seed";
import { titleCase, userName, dateTime } from "@/lib/format";
import { Icon } from "@/components/Icon";

const WORKFLOW = ["open", "investigating", "resolved", "closed"] as const;

const NOTES = [
  { date: "2026-07-03T09:20:00Z", by: "u-invig", note: "Initial statement captured at the invigilation desk; candidate cooperative." },
  { date: "2026-07-03T14:05:00Z", by: "u-ops", note: "Reviewed against seat CCTV; timestamps corroborate the report. Escalation criteria not yet met." },
];

export default function IncidentDetail({ params }: { params: { id: string } }) {
  const incident = INCIDENTS.find((i) => i.id === params.id);
  if (!incident) return notFound();

  const cand = incident.candidateId ? CANDIDATES.find((c) => c.id === incident.candidateId) : undefined;
  const currentStep = WORKFLOW.indexOf(incident.resolutionStatus);

  return (
    <div>
      <PageHeader
        title={`Incident ${incident.id}`}
        subtitle={`${titleCase(incident.type)} · Session ${incident.sessionId}`}
        actions={
          <>
            <RiskBadge level={incident.severity} />
            <StatusBadge status={incident.resolutionStatus} />
          </>
        }
      />

      <div className="mb-4">
        <InfoBanner tone="rose">
          <span className="font-medium">Confidentiality.</span> Incident evidence may contain candidate PII and biometric material. Access is restricted to authorized security and operations staff, is watermarked, and is retained under the exam-integrity retention policy.
        </InfoBanner>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Resolution workflow stepper */}
          <Card>
            <CardHeader title="Resolution workflow" subtitle="Maker-checker lifecycle for exam incidents" />
            <div className="p-5">
              <ol className="flex items-center">
                {WORKFLOW.map((step, i) => {
                  const done = i < currentStep;
                  const active = i === currentStep;
                  return (
                    <li key={step} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center">
                        <span className={`w-8 h-8 rounded-full grid place-items-center text-xs font-semibold ${active ? "bg-navy-800 text-white" : done ? "bg-teal-500 text-white" : "bg-navy-100 text-navy-400"}`}>
                          {done ? <Icon name="check" className="w-4 h-4" /> : i + 1}
                        </span>
                        <span className={`mt-1.5 text-[11px] font-medium ${active ? "text-navy-800" : "text-navy-400"}`}>{titleCase(step)}</span>
                      </div>
                      {i < WORKFLOW.length - 1 && <span className={`h-0.5 flex-1 mx-2 ${done ? "bg-teal-500" : "bg-navy-100"}`} />}
                    </li>
                  );
                })}
              </ol>
            </div>
          </Card>

          {/* Detail */}
          <Card>
            <CardHeader title="Incident detail" />
            <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <Field label="Type" value={titleCase(incident.type)} />
              <Field label="Reported" value={dateTime(incident.createdAt)} />
              <Field label="Reported by" value={userName(incident.reportedBy)} />
              <Field label="Session" value={incident.sessionId} mono />
              <Field label="Candidate" value={cand ? cand.fullName : "Not linked"} />
              <div className="md:col-span-3">
                <p className="text-[11px] uppercase tracking-wide text-navy-400 mb-0.5">Description</p>
                <p className="text-navy-700">{incident.description}</p>
              </div>
              <div className="md:col-span-3">
                <p className="text-[11px] uppercase tracking-wide text-navy-400 mb-0.5">Recommended action</p>
                <p className="text-navy-700">{incident.recommendedAction}</p>
              </div>
            </div>
          </Card>

          {/* Evidence */}
          <Card>
            <CardHeader title="Evidence attachments" subtitle="Locked — access is logged and watermarked" />
            <div className="p-5">
              {incident.evidence.length === 0 ? (
                <p className="text-sm text-navy-400">No evidence files attached to this incident.</p>
              ) : (
                <ul className="space-y-2">
                  {incident.evidence.map((f) => (
                    <li key={f} className="flex items-center justify-between gap-3 rounded-lg border border-navy-100 px-3 py-2">
                      <span className="flex items-center gap-2 text-sm text-navy-700">
                        <Icon name="lock" className="w-4 h-4 text-navy-400" />
                        <span className="font-mono text-[12px]">{f}</span>
                      </span>
                      <Badge tone="gray">Restricted</Badge>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-[11px] text-navy-400">Files are encrypted at rest. Downloading requires a security role and creates an audit record.</p>
            </div>
          </Card>

          {/* Investigation notes */}
          <Card>
            <CardHeader title="Investigation notes" subtitle="Internal — not visible to the candidate" />
            <div className="p-5 space-y-4">
              {NOTES.map((n, i) => (
                <div key={i} className="relative pl-5">
                  <span className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-teal-500" />
                  <p className="text-sm text-navy-700">{n.note}</p>
                  <p className="text-[11px] text-navy-400 mt-0.5">{userName(n.by)} · {dateTime(n.date)}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar actions */}
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-navy-800 mb-3">Actions</h3>
            <div className="flex flex-col gap-2">
              <Button variant="secondary"><Icon name="committee" className="w-4 h-4" />Escalate to committee</Button>
              <Button variant="primary"><Icon name="check" className="w-4 h-4" />Resolve</Button>
              <Button variant="danger"><Icon name="x" className="w-4 h-4" />Void attempt</Button>
            </div>
            <p className="mt-3 text-[11px] text-navy-400">Voiding an attempt is irreversible and requires certification-manager approval (maker-checker).</p>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-navy-800 mb-3">Linked records</h3>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-navy-400">Session</dt>
                <dd><Link href={`/sessions/${incident.sessionId}`} className="font-medium text-teal-600 hover:underline">{incident.sessionId}</Link></dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-navy-400">Candidate</dt>
                <dd className="font-medium text-navy-700">{cand ? cand.fullName : "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-navy-400">Severity</dt>
                <dd><RiskBadge level={incident.severity} /></dd>
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
