"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader, Card, Kpi, Badge, StatusBadge, Table, Th, Td, InfoBanner } from "@/components/ui";
import { SESSIONS } from "@/data/seed";
import { certName, certCode, centerName, titleCase, shortDate } from "@/lib/format";
import { Icon } from "@/components/Icon";

const DELIVERY: string[] = ["center", "remote", "blended", "third_party"];
const STATUSES: string[] = ["scheduled", "active", "completed", "cancelled", "under_investigation"];

export default function SessionsPage() {
  const [status, setStatus] = useState("all");
  const [delivery, setDelivery] = useState("all");

  const rows = useMemo(() => SESSIONS.filter((s) => {
    if (status !== "all" && s.status !== status) return false;
    if (delivery !== "all" && s.deliveryMethod !== delivery) return false;
    return true;
  }), [status, delivery]);

  const count = (fn: (s: (typeof SESSIONS)[number]) => boolean) => SESSIONS.filter(fn).length;

  return (
    <div>
      <PageHeader
        title="Exam Sessions"
        subtitle="Scheduling and live status of certification sittings across all centers and delivery channels."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Kpi label="Total Sessions" value={SESSIONS.length} tone="navy" />
        <Kpi label="Scheduled" value={count((s) => s.status === "scheduled")} tone="teal" />
        <Kpi label="Active Now" value={count((s) => s.status === "active")} tone="green" />
        <Kpi label="Under Investigation" value={count((s) => s.status === "under_investigation")} tone="red" />
      </div>

      <InfoBanner tone="teal">
        <span className="font-medium">Live operations view.</span> Active sessions are monitored in real time; incidents raised during a sitting flow directly to the security and committee workflows.
      </InfoBanner>

      <Card className="mt-5">
        <div className="flex flex-wrap items-center gap-2 p-4 border-b border-navy-100">
          <span className="text-xs font-medium text-navy-400 mr-1">Filter</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-navy-200 bg-white text-sm py-2 px-2.5">
            <option value="all">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}
          </select>
          <select value={delivery} onChange={(e) => setDelivery(e.target.value)} className="rounded-lg border border-navy-200 bg-white text-sm py-2 px-2.5">
            <option value="all">All delivery methods</option>
            {DELIVERY.map((d) => <option key={d} value={d}>{titleCase(d)}</option>)}
          </select>
        </div>
        <Table>
          <thead>
            <tr>
              <Th>Session</Th><Th>Certification</Th><Th>Form</Th><Th>Date / Time</Th><Th>Duration</Th><Th>Center</Th><Th>Room</Th><Th>Delivery</Th><Th className="text-right">Seats</Th><Th className="text-right">Candidates</Th><Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => {
              const isActive = s.status === "active";
              return (
                <tr key={s.id} className={isActive ? "bg-emerald-50/60 hover:bg-emerald-50" : "hover:bg-navy-50/60"}>
                  <Td>
                    <Link href={`/sessions/${s.id}`} className="font-medium text-teal-600 hover:underline inline-flex items-center gap-1.5">
                      {isActive && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                      {s.id}
                    </Link>
                  </Td>
                  <Td><span title={certName(s.certificationId)}>{certCode(s.certificationId)}</span></Td>
                  <Td className="font-mono text-[12px] text-navy-500">{s.formId}</Td>
                  <Td className="whitespace-nowrap">{shortDate(s.date)} · {s.startTime}</Td>
                  <Td className="tabular-nums">{s.durationMinutes} min</Td>
                  <Td className="text-navy-600">{centerName(s.centerId)}</Td>
                  <Td>{s.room}</Td>
                  <Td><Badge tone="blue">{titleCase(s.deliveryMethod)}</Badge></Td>
                  <Td className="text-right tabular-nums">{s.seatCapacity}</Td>
                  <Td className="text-right tabular-nums">{s.candidateIds.length}</Td>
                  <Td>{isActive ? <Badge tone="green"><Icon name="clock" className="w-3 h-3 mr-1" />Active now</Badge> : <StatusBadge status={s.status} />}</Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        <div className="px-4 py-3 text-xs text-navy-400">Showing {rows.length} of {SESSIONS.length} sessions.</div>
      </Card>
    </div>
  );
}
