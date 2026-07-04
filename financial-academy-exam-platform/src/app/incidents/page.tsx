"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader, Card, CardHeader, Kpi, StatusBadge, RiskBadge, Table, Th, Td, InfoBanner, Button } from "@/components/ui";
import { INCIDENTS, CANDIDATES } from "@/data/seed";
import { titleCase, userName, dateTime } from "@/lib/format";
import { Icon } from "@/components/Icon";

const INCIDENT_TYPES: { key: string; label: string; desc: string }[] = [
  { key: "identity", label: "Identity", desc: "ID mismatch or verification failure at check-in." },
  { key: "technical", label: "Technical", desc: "Device, software or hardware fault affecting delivery." },
  { key: "suspected_cheating", label: "Suspected Cheating", desc: "Collusion, prohibited material or answer sharing." },
  { key: "behavior", label: "Behavior", desc: "Disruptive or non-compliant candidate conduct." },
  { key: "late_arrival", label: "Late Arrival", desc: "Candidate arrived after the permitted window." },
  { key: "wrong_exam", label: "Wrong Exam", desc: "Incorrect form or certification loaded for candidate." },
  { key: "system_interruption", label: "System Interruption", desc: "Power, network or platform outage during a session." },
  { key: "emergency", label: "Emergency", desc: "Evacuation, medical or safety event." },
  { key: "other", label: "Other", desc: "Any incident not covered by the categories above." },
];

const SEVERITIES = ["low", "medium", "high", "critical"] as const;
const STATUSES = ["open", "investigating", "resolved", "closed"] as const;

export default function IncidentsPage() {
  const [type, setType] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [status, setStatus] = useState("all");

  const rows = useMemo(() => INCIDENTS.filter((i) => {
    if (type !== "all" && i.type !== type) return false;
    if (severity !== "all" && i.severity !== severity) return false;
    if (status !== "all" && i.resolutionStatus !== status) return false;
    return true;
  }), [type, severity, status]);

  const total = INCIDENTS.length;
  const open = INCIDENTS.filter((i) => i.resolutionStatus === "open").length;
  const critHigh = INCIDENTS.filter((i) => i.severity === "critical" || i.severity === "high").length;
  const resolved = INCIDENTS.filter((i) => i.resolutionStatus === "resolved" || i.resolutionStatus === "closed").length;

  return (
    <div>
      <PageHeader
        title="Incident Management"
        subtitle="Exam-day events reported by invigilators and proctors. All records are audited and feed the Security & Integrity Committee."
        actions={<Button variant="secondary"><Icon name="alert" className="w-4 h-4" />Report incident</Button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Kpi label="Total Incidents" value={total} tone="navy" />
        <Kpi label="Open" value={open} tone="red" />
        <Kpi label="Critical / High" value={critHigh} tone="gold" />
        <Kpi label="Resolved / Closed" value={resolved} tone="green" />
      </div>

      <InfoBanner tone="amber">
        <span className="font-medium">Handling note.</span> Incident evidence (CCTV, invigilator statements) is confidential and access-controlled. Only escalate to the committee with the candidate&apos;s consent record attached where required.
      </InfoBanner>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-5">
        <div className="lg:col-span-2">
          <Card>
            <div className="flex flex-wrap items-center gap-2 p-4 border-b border-navy-100">
              <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-lg border border-navy-200 bg-white text-sm py-2 px-2.5">
                <option value="all">All types</option>
                {INCIDENT_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
              <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="rounded-lg border border-navy-200 bg-white text-sm py-2 px-2.5">
                <option value="all">All severities</option>
                {SEVERITIES.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}
              </select>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-navy-200 bg-white text-sm py-2 px-2.5">
                <option value="all">All statuses</option>
                {STATUSES.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}
              </select>
            </div>
            <Table>
              <thead>
                <tr>
                  <Th>Incident</Th><Th>Type</Th><Th>Session</Th><Th>Candidate</Th><Th>Severity</Th><Th>Reported by</Th><Th>Recommended action</Th><Th>Status</Th><Th>Reported</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((i) => {
                  const cand = i.candidateId ? CANDIDATES.find((c) => c.id === i.candidateId) : undefined;
                  return (
                    <tr key={i.id} className="hover:bg-navy-50/60">
                      <Td><Link href={`/incidents/${i.id}`} className="font-mono text-[12px] font-medium text-teal-600 hover:underline">{i.id}</Link></Td>
                      <Td>{titleCase(i.type)}</Td>
                      <Td className="font-mono text-[12px] text-navy-500">{i.sessionId}</Td>
                      <Td className="text-navy-600">{cand ? cand.fullName : "—"}</Td>
                      <Td><RiskBadge level={i.severity} /></Td>
                      <Td className="text-navy-600">{userName(i.reportedBy)}</Td>
                      <Td className="text-xs text-navy-500">{i.recommendedAction}</Td>
                      <Td><StatusBadge status={i.resolutionStatus} /></Td>
                      <Td className="text-xs text-navy-400 whitespace-nowrap">{dateTime(i.createdAt)}</Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
            <div className="px-4 py-3 text-xs text-navy-400">Showing {rows.length} of {total} incidents.</div>
          </Card>
        </div>

        <Card>
          <CardHeader title="Incident-type legend" subtitle="Standard TFA classification" />
          <div className="p-4 space-y-3">
            {INCIDENT_TYPES.map((t) => (
              <div key={t.key} className="flex gap-2.5">
                <span className="mt-0.5 shrink-0"><Icon name="alert" className="w-4 h-4 text-navy-300" /></span>
                <div>
                  <p className="text-sm font-medium text-navy-800">{t.label}</p>
                  <p className="text-xs text-navy-400">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
