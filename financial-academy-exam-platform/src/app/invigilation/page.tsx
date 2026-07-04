"use client";
import { useState } from "react";
import { PageHeader, Card, CardHeader, Kpi, Badge, StatusBadge, Button, InfoBanner, Restricted, Table, Th, Td } from "@/components/ui";
import { Meter } from "@/components/charts";
import { Icon } from "@/components/Icon";
import { SESSIONS, ATTEMPTS, CANDIDATES } from "@/data/seed";
import { certName, centerName } from "@/lib/format";
import { useSession } from "@/lib/session";
import { can } from "@/lib/permissions";

const INCIDENT_TYPES: { type: string; label: string; hint: string }[] = [
  { type: "identity", label: "Identity", hint: "ID mismatch / verification failure" },
  { type: "technical", label: "Technical", hint: "Device, freeze, or software fault" },
  { type: "suspected_cheating", label: "Suspected cheating", hint: "Collusion or prohibited material" },
  { type: "behavior", label: "Behavior", hint: "Disruptive or non-compliant conduct" },
  { type: "late_arrival", label: "Late arrival", hint: "Candidate arrived after start" },
  { type: "wrong_exam", label: "Wrong exam", hint: "Incorrect form or session loaded" },
  { type: "system_interruption", label: "System interruption", hint: "Power / network outage" },
  { type: "emergency", label: "Emergency", hint: "Evacuation / medical event" },
];

export default function InvigilationPage() {
  const { user } = useSession();
  const [attendance, setAttendance] = useState<Record<string, "present" | "no_show">>({});

  if (!can(user.roleKey, "run_invigilation")) {
    return (
      <div>
        <PageHeader title="Live Invigilation" subtitle="Active exam session monitoring" />
        <Restricted message="Invigilation is limited to invigilators and operations." />
      </div>
    );
  }

  const session = SESSIONS.find((s) => s.id === "sess-2");
  const attempts = ATTEMPTS.filter((a) => a.sessionId === "sess-2");

  if (!session) {
    return (
      <div>
        <PageHeader title="Live Invigilation" subtitle="Active exam session monitoring" />
        <InfoBanner tone="amber">No active session is currently in progress.</InfoBanner>
      </div>
    );
  }

  const total = attempts.length;
  const verified = attempts.filter((a) => a.identityVerified).length;
  const inProgress = attempts.filter((a) => a.loginStatus === "in_progress").length;
  const flagged = attempts.filter((a) => a.flags.length > 0).length;
  // Live time-remaining proxy from candidate clocks (fictional demo data).
  const activeClocks = attempts.filter((a) => a.loginStatus === "in_progress").map((a) => a.timeRemainingMin);
  const avgRemaining = activeClocks.length ? Math.round(activeClocks.reduce((s, v) => s + v, 0) / activeClocks.length) : 0;
  const remMM = String(Math.floor(avgRemaining)).padStart(2, "0");

  const presentCount = attempts.filter((a) => attendance[a.id] !== "no_show").length;
  const noShowCount = attempts.filter((a) => attendance[a.id] === "no_show").length;

  const markNoShow = (id: string) =>
    setAttendance((prev) => ({ ...prev, [id]: prev[id] === "no_show" ? "present" : "no_show" }));

  return (
    <div>
      <PageHeader
        title="Live Invigilation"
        subtitle={`${certName(session.certificationId)} · ${centerName(session.centerId)} · ${session.room}`}
        actions={
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />LIVE
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-navy-800 text-white px-3 py-1.5 text-sm font-semibold tabular-nums">
              <Icon name="clock" className="w-4 h-4" />{remMM}:00 remaining
            </span>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Kpi label="Active candidates" value={total} tone="navy" hint={`${session.startTime} start · ${session.durationMinutes} min`} />
        <Kpi label="Identity verified" value={`${verified}/${total}`} tone={verified === total ? "green" : "gold"} hint="Photo & National ID checked" />
        <Kpi label="In progress" value={inProgress} tone="teal" hint="Actively sitting the exam" />
        <Kpi label="Flagged" value={flagged} tone={flagged ? "red" : "green"} hint="Suspicious-behavior alerts" />
      </div>

      <InfoBanner tone="teal">
        <span className="font-medium">Segregation of duties:</span> invigilators monitor delivery only. You have <span className="font-semibold">no access to question or answer-key content</span> — the exam interface renders securely on each candidate device.
      </InfoBanner>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 mt-4">
        <div className="xl:col-span-3">
          <Card>
            <CardHeader title="Live candidate board" subtitle={`Session ${session.id} · seat-by-seat delivery status`} />
            <Table>
              <thead>
                <tr>
                  <Th>Seat</Th>
                  <Th>Candidate</Th>
                  <Th>Login</Th>
                  <Th>ID</Th>
                  <Th className="w-40">Progress</Th>
                  <Th>Time left</Th>
                  <Th>Connection</Th>
                  <Th>Flags</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((a) => {
                  const cand = CANDIDATES.find((c) => c.id === a.candidateId);
                  const hasFlag = a.flags.length > 0;
                  const noShow = attendance[a.id] === "no_show";
                  return (
                    <tr key={a.id} className={hasFlag ? "bg-rose-50/60" : noShow ? "bg-navy-50/60" : ""}>
                      <Td className="font-medium tabular-nums">{a.seat}</Td>
                      <Td>
                        <span className={`font-medium ${noShow ? "text-navy-400 line-through" : "text-navy-800"}`}>{cand?.fullName ?? a.candidateId}</span>
                      </Td>
                      <Td>{noShow ? <Badge tone="gray">No-show</Badge> : <StatusBadge status={a.loginStatus} />}</Td>
                      <Td>
                        {a.identityVerified
                          ? <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-600"><Icon name="check" className="w-4 h-4" /></span>
                          : <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-50 text-rose-600"><Icon name="x" className="w-4 h-4" /></span>}
                      </Td>
                      <Td>
                        <div className="w-32"><Meter value={a.progress} tone={a.progress > 66 ? "green" : a.progress > 33 ? "teal" : "amber"} label="" /></div>
                        <span className="text-[10px] text-navy-400 tabular-nums">{a.progress}% answered</span>
                      </Td>
                      <Td className="tabular-nums">{a.timeRemainingMin} min</Td>
                      <Td><StatusBadge status={a.connection} /></Td>
                      <Td>
                        {hasFlag ? a.flags.map((f) => <Badge key={f} tone="amber">{f}</Badge>) : <span className="text-navy-300 text-xs">None</span>}
                      </Td>
                      <Td className="text-right">
                        <div className="inline-flex items-center gap-1">
                          <Button variant="ghost" className="!px-2 !py-1 text-xs">Pause</Button>
                          <Button variant="ghost" className="!px-2 !py-1 text-xs">Assist log</Button>
                          <Button variant="secondary" href="/incidents" className="!px-2 !py-1 text-xs">Report incident</Button>
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card>

          <p className="text-[11px] text-navy-400 mt-2">
            Row actions are demonstration controls — Pause, Assist log and Report incident are recorded against the session audit trail. Rows highlighted in <span className="text-rose-600 font-medium">rose</span> carry active suspicious-behavior flags requiring invigilator attention.
          </p>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Attendance / no-show" subtitle="Mark candidates who did not appear" />
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-emerald-600">Present</p>
                  <p className="text-lg font-semibold text-emerald-700 tabular-nums">{presentCount}</p>
                </div>
                <div className="flex-1 rounded-lg bg-navy-50 border border-navy-100 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wide text-navy-500">No-show</p>
                  <p className="text-lg font-semibold text-navy-700 tabular-nums">{noShowCount}</p>
                </div>
              </div>
              <ul className="space-y-1.5">
                {attempts.map((a) => {
                  const cand = CANDIDATES.find((c) => c.id === a.candidateId);
                  const noShow = attendance[a.id] === "no_show";
                  return (
                    <li key={a.id} className="flex items-center justify-between gap-2 text-xs">
                      <span className={noShow ? "text-navy-400 line-through" : "text-navy-700"}>{a.seat} · {cand?.fullName ?? a.candidateId}</span>
                      <Button variant={noShow ? "secondary" : "ghost"} className="!px-2 !py-0.5 text-[11px]" onClick={() => markNoShow(a.id)}>
                        {noShow ? "Undo" : "No-show"}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Card>

          <Card>
            <CardHeader title="Incident types" subtitle="Quick reference for reporting" />
            <div className="p-4 space-y-2">
              {INCIDENT_TYPES.map((t) => (
                <div key={t.type} className="flex items-start gap-2.5">
                  <span className="mt-0.5 text-rose-500"><Icon name="alert" className="w-4 h-4" /></span>
                  <div>
                    <p className="text-xs font-medium text-navy-700">{t.label}</p>
                    <p className="text-[11px] text-navy-400">{t.hint}</p>
                  </div>
                </div>
              ))}
              <Button variant="secondary" href="/incidents" className="w-full justify-center mt-2">
                <Icon name="report" className="w-4 h-4" />Open incident log
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
