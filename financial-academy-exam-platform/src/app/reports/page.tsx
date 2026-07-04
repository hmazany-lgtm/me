"use client";
import { useMemo, useState } from "react";
import {
  Card, CardHeader, Kpi, PageHeader, Badge, StatusBadge, RiskBadge,
  Table, Th, Td, Button, Restricted, InfoBanner,
} from "@/components/ui";
import { BarChart, GroupedBar, Donut, Meter } from "@/components/charts";
import {
  CERTIFICATIONS, CENTERS, SESSIONS, CANDIDATES, QUESTIONS, RESULTS,
  CERTIFICATES, APPEALS, VENDORS, SECURITY_ALERTS, AUDIT_LOGS, USERS,
} from "@/data/seed";
import { sar, num, certCode, certName, centerName, userName, shortDate, dateTime, titleCase } from "@/lib/format";
import { useSession } from "@/lib/session";
import { can } from "@/lib/permissions";
import { computeBankHealth, distractorAnalysis } from "@/lib/analytics";
import Link from "next/link";

const C = { navy: "#1f3a5c", teal: "#0e7c86", gold: "#c9a24b", slate: "#4f719b", rose: "#e11d48" };

type TabKey = "executive" | "operational" | "psychometric" | "security" | "candidate";
const TABS: { key: TabKey; label: string }[] = [
  { key: "executive", label: "Executive" },
  { key: "operational", label: "Operational" },
  { key: "psychometric", label: "Psychometric" },
  { key: "security", label: "Security" },
  { key: "candidate", label: "Candidate" },
];

/** Download-PDF control gated behind the download_reports permission. */
function DownloadBtn({ report }: { report: string }) {
  const { user, logAccess } = useSession();
  if (!can(user.roleKey, "download_reports")) return null;
  return (
    <Button
      variant="secondary"
      onClick={() => logAccess({ action: "report_downloaded", object: report, risk: "low" })}
    >
      Download PDF
    </Button>
  );
}

const SectionBody = ({ children }: { children: React.ReactNode }) => <div className="p-5">{children}</div>;

export default function ReportsPage() {
  const { user } = useSession();
  const [tab, setTab] = useState<TabKey>("executive");

  const activeCerts = useMemo(() => CERTIFICATIONS.filter((c) => c.status !== "draft"), []);
  const aggregatedOnly = user.roleKey === "executive" || user.roleKey === "vendor";

  if (!can(user.roleKey, "view_reports")) {
    return (
      <div>
        <PageHeader title="Reports & Analytics" subtitle="Comprehensive certification, operational, psychometric, security, and candidate reporting." />
        <Restricted message="Viewing reports requires the view_reports permission. Contact an administrator if you believe you should have access." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        subtitle={`Executive, operational, psychometric, security, and candidate reporting. Signed in as ${user.fullName}.`}
        actions={<Badge tone="teal">{TABS.find((t) => t.key === tab)?.label} reports</Badge>}
      />

      <div className="mb-4">
        <InfoBanner tone="blue">
          Reports use question IDs, domains and statistics only. Full question text and correct answers are never exposed here.
        </InfoBanner>
      </div>

      {aggregatedOnly && (
        <div className="mb-4">
          <InfoBanner tone="teal">
            {titleCase(user.roleKey)} view — figures are aggregated. Individual exam content, correct answers, and candidate PII are masked at this level.
          </InfoBanner>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 border-b border-navy-100 mb-5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 transition ${
              tab === t.key
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-navy-500 hover:text-navy-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "executive" && <ExecutiveTab activeCerts={activeCerts} />}
      {tab === "operational" && <OperationalTab />}
      {tab === "psychometric" && <PsychometricTab />}
      {tab === "security" && <SecurityTab masked={aggregatedOnly} />}
      {tab === "candidate" && <CandidateTab />}
    </div>
  );
}

/* ============================ A. EXECUTIVE ================================= */
function ExecutiveTab({ activeCerts }: { activeCerts: typeof CERTIFICATIONS }) {
  const totalCandidates = CANDIDATES.length;
  const totalRevenue = CERTIFICATIONS.reduce((s, c) => s + c.stats.revenue, 0);
  const released = RESULTS.filter((r) => r.status === "released" || r.status === "approved");
  const passRate = released.length ? Math.round((released.filter((r) => r.passed).length / released.length) * 100) : 0;
  const health = computeBankHealth(QUESTIONS);
  const openAlerts = SECURITY_ALERTS.filter((a) => a.status === "open").length;

  const passFail = activeCerts.map((c) => ({ label: certCode(c.id), values: [c.stats.passRate, c.stats.failRate] }));
  const revenueByCert = activeCerts.map((c) => ({ label: certCode(c.id), value: Math.round(c.stats.revenue / 1000) }));
  const occupancy = CENTERS.filter((c) => c.status !== "future").map((c) => ({
    label: c.city,
    value: Math.round((c.seatsBooked / c.capacity) * 100),
  }));

  const bySeverity = (["critical", "high", "medium", "low"] as const).map((sev, i) => ({
    label: titleCase(sev),
    value: SECURITY_ALERTS.filter((a) => a.severity === sev).length,
    color: [C.rose, "#f97316", C.gold, C.teal][i],
  }));

  return (
    <div className="space-y-4">
      {/* Board summary KPIs */}
      <Card>
        <CardHeader title="Board Summary" subtitle="Portfolio headline metrics, year to date" action={<DownloadBtn report="Executive — Board Summary" />} />
        <div className="p-5 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          <Kpi label="Active Certifications" value={activeCerts.length} tone="navy" />
          <Kpi label="Registered Candidates" value={num(totalCandidates)} delta="+8%" tone="teal" />
          <Kpi label="Avg Pass Rate" value={`${passRate}%`} delta="+3pt" tone="green" />
          <Kpi label="Exam Revenue" value={sar(totalRevenue)} delta="+12%" tone="gold" />
          <Kpi label="Bank Health" value={`${health.score}/100`} hint={health.band} tone={health.score >= 75 ? "green" : "gold"} />
          <Kpi label="Open Security Alerts" value={openAlerts} tone={openAlerts ? "red" : "green"} />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Certification Portfolio Performance" subtitle="Pass vs fail rate per certification" action={<DownloadBtn report="Executive — Portfolio Performance" />} />
          <SectionBody>
            <GroupedBar data={passFail} series={[{ name: "Pass %", color: C.teal }, { name: "Fail %", color: C.rose }]} />
          </SectionBody>
        </Card>
        <Card>
          <CardHeader title="Risk & Security Overview" subtitle="Open + historical alerts by severity" action={<DownloadBtn report="Executive — Risk & Security Overview" />} />
          <SectionBody>
            <Donut data={bySeverity} centerLabel="Alerts by severity" centerValue={`${SECURITY_ALERTS.length}`} />
          </SectionBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Revenue by Certification" subtitle="SAR thousands, YTD" action={<DownloadBtn report="Executive — Revenue" />} />
          <SectionBody><BarChart data={revenueByCert} unit="k" color={C.gold} /></SectionBody>
        </Card>
        <Card>
          <CardHeader title="Center Utilization" subtitle="Seats booked vs capacity (%)" action={<DownloadBtn report="Executive — Center Utilization" />} />
          <SectionBody><BarChart data={occupancy} unit="%" color={C.navy} /></SectionBody>
        </Card>
      </div>
    </div>
  );
}

/* ============================ B. OPERATIONAL ============================== */
function OperationalTab() {
  const occupancy = CENTERS.filter((c) => c.status !== "future").map((c) => ({
    label: c.city,
    value: Math.round((c.seatsBooked / c.capacity) * 100),
  }));

  const attendance = CERTIFICATIONS.filter((c) => c.status !== "draft").map((c) => ({
    cert: c,
    noShow: c.stats.noShowRate,
  }));

  const invigilators = USERS.filter((u) => u.roleKey === "invigilator");
  const invRows = invigilators.map((u, i) => {
    const sessions = SESSIONS.filter((s) => s.invigilatorIds.includes(u.id));
    const candidates = sessions.reduce((s, x) => s + x.candidateIds.length, 0);
    return {
      user: u,
      sessions: sessions.length,
      candidates,
      incidents: 2 + (i % 3),
      punctuality: 96 - i * 2,
      rating: (4.6 - i * 0.1).toFixed(1),
    };
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Exam Sessions" subtitle="Scheduling, delivery, and status across centers" action={<DownloadBtn report="Operational — Exam Sessions" />} />
        <Table>
          <thead><tr><Th>Session</Th><Th>Certification</Th><Th>Date</Th><Th>Center</Th><Th>Delivery</Th><Th>Seats</Th><Th>Status</Th></tr></thead>
          <tbody>
            {SESSIONS.map((s) => (
              <tr key={s.id}>
                <Td className="font-medium text-navy-800">{s.id.toUpperCase()}</Td>
                <Td>{certCode(s.certificationId)}</Td>
                <Td>{shortDate(s.date)} · {s.startTime}</Td>
                <Td>{centerName(s.centerId)}</Td>
                <Td>{titleCase(s.deliveryMethod)}</Td>
                <Td className="tabular-nums">{s.candidateIds.length}/{s.seatCapacity}</Td>
                <Td><StatusBadge status={s.status} /></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Center Utilization" subtitle="Occupancy by center (%)" action={<DownloadBtn report="Operational — Center Utilization" />} />
          <SectionBody><BarChart data={occupancy} unit="%" color={C.teal} /></SectionBody>
        </Card>
        <Card>
          <CardHeader title="Attendance & No-show Analysis" subtitle="Derived from certification statistics" action={<DownloadBtn report="Operational — Attendance & No-show" />} />
          <Table>
            <thead><tr><Th>Certification</Th><Th>Candidates</Th><Th>Attendance</Th><Th>No-show</Th></tr></thead>
            <tbody>
              {attendance.map(({ cert, noShow }) => (
                <tr key={cert.id}>
                  <Td className="font-medium text-navy-800">{cert.code}</Td>
                  <Td className="tabular-nums">{cert.stats.candidates}</Td>
                  <Td><div className="w-28"><Meter value={100 - noShow} tone="green" /></div></Td>
                  <Td><Badge tone={noShow > 8 ? "amber" : "green"}>{noShow}%</Badge></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Invigilator Performance" subtitle="Sessions covered, incidents, and ratings" action={<DownloadBtn report="Operational — Invigilator Performance" />} />
          <Table>
            <thead><tr><Th>Invigilator</Th><Th>Sessions</Th><Th>Candidates</Th><Th>Incidents</Th><Th>Punctuality</Th><Th>Rating</Th></tr></thead>
            <tbody>
              {invRows.map((r) => (
                <tr key={r.user.id}>
                  <Td className="font-medium text-navy-800">{r.user.fullName}</Td>
                  <Td className="tabular-nums">{r.sessions}</Td>
                  <Td className="tabular-nums">{r.candidates}</Td>
                  <Td className="tabular-nums">{r.incidents}</Td>
                  <Td><Badge tone={r.punctuality >= 95 ? "green" : "amber"}>{r.punctuality}%</Badge></Td>
                  <Td className="tabular-nums">{r.rating} / 5</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
        <Card>
          <CardHeader title="SLA Performance" subtitle="Vendor service levels vs targets" action={<DownloadBtn report="Operational — SLA Performance" />} />
          <div className="p-5 space-y-4">
            {VENDORS.map((v) => (
              <div key={v.id}>
                <div className="flex items-center justify-between text-xs text-navy-600 mb-1">
                  <span className="font-medium text-navy-800">{v.name} <span className="text-navy-400 font-normal">· {titleCase(v.type)}</span></span>
                  <span className="tabular-nums">{v.slaActual}% / target {v.slaTarget}%</span>
                </div>
                <Meter value={v.slaActual} tone={v.slaActual >= v.slaTarget ? "green" : v.slaActual >= v.slaTarget - 2 ? "amber" : "red"} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ============================ C. PSYCHOMETRIC ============================= */
function PsychometricTab() {
  const health = computeBankHealth(QUESTIONS);

  const difficultyBuckets = [
    { label: "0–.25", value: QUESTIONS.filter((q) => q.difficultyIndex < 0.25).length },
    { label: ".25–.5", value: QUESTIONS.filter((q) => q.difficultyIndex >= 0.25 && q.difficultyIndex < 0.5).length },
    { label: ".5–.75", value: QUESTIONS.filter((q) => q.difficultyIndex >= 0.5 && q.difficultyIndex < 0.75).length },
    { label: ".75–1", value: QUESTIONS.filter((q) => q.difficultyIndex >= 0.75).length },
  ];
  const discBuckets = [
    { label: "Negative", value: QUESTIONS.filter((q) => q.discriminationIndex < 0).length },
    { label: "Weak <.15", value: QUESTIONS.filter((q) => q.discriminationIndex >= 0 && q.discriminationIndex < 0.15).length },
    { label: "Fair .15–.3", value: QUESTIONS.filter((q) => q.discriminationIndex >= 0.15 && q.discriminationIndex < 0.3).length },
    { label: "Good ≥.3", value: QUESTIONS.filter((q) => q.discriminationIndex >= 0.3).length },
  ];

  // Distractor analysis summary across the bank
  let nonFunctioning = 0, strongDistractor = 0, keyTooFew = 0;
  for (const q of QUESTIONS) {
    for (const o of distractorAnalysis(q)) {
      if (o.verdict === "Non-functioning distractor") nonFunctioning++;
      else if (o.verdict === "Strong distractor — possible mis-key") strongDistractor++;
      else if (o.verdict === "Key chosen by too few — review difficulty") keyTooFew++;
    }
  }

  // Domain performance — average of released domain scores, top domains
  const domMap = new Map<string, { sum: number; n: number }>();
  for (const r of RESULTS) for (const d of r.domainScores) {
    const cur = domMap.get(d.domain) ?? { sum: 0, n: 0 };
    cur.sum += d.score; cur.n += 1; domMap.set(d.domain, cur);
  }
  const domainPerf = [...domMap.entries()]
    .map(([label, { sum, n }]) => ({ label, value: Math.round(sum / n) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Reliability & Bank Health" subtitle="Question IDs and statistics only — no stems shown" action={<DownloadBtn report="Psychometric — Reliability & Bank Health" />} />
        <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Kpi label="Cronbach's α (placeholder)" value="0.84" hint="Internal consistency" tone="teal" />
          <Kpi label="Bank Health" value={`${health.score}/100`} hint={health.band} tone={health.score >= 75 ? "green" : "gold"} />
          <Kpi label="Items Analysed" value={num(QUESTIONS.length)} tone="navy" />
          <Kpi label="Weak-discrimination Items" value={QUESTIONS.filter((q) => q.discriminationIndex < 0.15).length} tone="gold" />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Item Difficulty Distribution" subtitle="Count of items by p-value band" action={<DownloadBtn report="Psychometric — Difficulty Distribution" />} />
          <SectionBody><BarChart data={difficultyBuckets} color={C.teal} /></SectionBody>
        </Card>
        <Card>
          <CardHeader title="Item Discrimination Distribution" subtitle="Count of items by discrimination band" action={<DownloadBtn report="Psychometric — Discrimination Distribution" />} />
          <SectionBody><BarChart data={discBuckets} color={C.navy} /></SectionBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Distractor Analysis Summary" subtitle="Aggregate option-level verdicts across the bank" action={<DownloadBtn report="Psychometric — Distractor Analysis" />} />
          <div className="p-5 grid grid-cols-3 gap-3">
            <Kpi label="Non-functioning Distractors" value={nonFunctioning} tone="gold" />
            <Kpi label="Possible Mis-key" value={strongDistractor} tone="red" />
            <Kpi label="Keys Chosen by Too Few" value={keyTooFew} tone="navy" />
          </div>
        </Card>
        <Card>
          <CardHeader title="Domain Performance" subtitle="Average scaled domain scores (top domains)" action={<DownloadBtn report="Psychometric — Domain Performance" />} />
          <SectionBody><BarChart data={domainPerf} color={C.gold} /></SectionBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Question Bank Health" subtitle={`Composite score ${health.score}/100 — ${health.band}`} action={<DownloadBtn report="Psychometric — Question Bank Health" />} />
        <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            {health.factors.map((f) => (
              <div key={f.label}>
                <div className="flex justify-between text-xs text-navy-600 mb-1">
                  <span>{f.label} <span className="text-navy-400">· {f.note}</span></span>
                  <span className="tabular-nums">{f.value}</span>
                </div>
                <Meter value={f.value} tone={f.value >= 80 ? "green" : f.value >= 60 ? "teal" : f.value >= 40 ? "amber" : "red"} />
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-navy-400 mb-2">Recommendations</p>
            <ul className="space-y-2">
              {health.recommendations.map((r, i) => (
                <li key={i} className="flex gap-2 text-sm text-navy-700">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />{r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ============================ D. SECURITY ================================= */
function SecurityTab({ masked }: { masked: boolean }) {
  const overExposed = QUESTIONS.filter((q) => q.usageCount > q.exposureLimit);
  const compromised = QUESTIONS.filter((q) => q.status === "compromised");
  const behaviorAlerts = SECURITY_ALERTS.filter((a) => a.type === "behavior");

  const actionCounts = new Map<string, number>();
  for (const l of AUDIT_LOGS) actionCounts.set(l.action, (actionCounts.get(l.action) ?? 0) + 1);
  const auditSummary = [...actionCounts.entries()].sort((a, b) => b[1] - a[1]);

  const exportQueue = [
    { id: "exp-1", item: "AML item bank (30 items)", requestedBy: "u-psych", checker: "u-committee", status: "pending" },
    { id: "exp-2", item: "CIB blueprint export", requestedBy: "u-ops", checker: "u-committee", status: "approved" },
    { id: "exp-3", item: "CMA form A metadata", requestedBy: "u-cert", checker: "u-admin", status: "rejected" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Question Exposure Report" subtitle="Items over exposure limit — IDs and statistics only" action={<DownloadBtn report="Security — Question Exposure" />} />
          <Table>
            <thead><tr><Th>Question ID</Th><Th>Certification</Th><Th>Usage</Th><Th>Limit</Th><Th>Status</Th></tr></thead>
            <tbody>
              {overExposed.length === 0 && <tr><Td>No items over exposure limit.</Td></tr>}
              {overExposed.map((q) => (
                <tr key={q.id}>
                  <Td className="font-mono text-xs text-navy-800">{q.id}</Td>
                  <Td>{certCode(q.certificationId)}</Td>
                  <Td><Badge tone="red">{q.usageCount}</Badge></Td>
                  <Td className="tabular-nums">{q.exposureLimit}</Td>
                  <Td><StatusBadge status={q.status} /></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
        <Card>
          <CardHeader title="Compromised Questions" subtitle="Items flagged compromised — IDs only, never stems" action={<DownloadBtn report="Security — Compromised Questions" />} />
          <Table>
            <thead><tr><Th>Question ID</Th><Th>Certification</Th><Th>Domain</Th><Th>Flags</Th><Th>Status</Th></tr></thead>
            <tbody>
              {compromised.length === 0 && <tr><Td>No compromised items.</Td></tr>}
              {compromised.map((q) => (
                <tr key={q.id}>
                  <Td className="font-mono text-xs text-navy-800">{q.id}</Td>
                  <Td>{certCode(q.certificationId)}</Td>
                  <Td>{q.domain}</Td>
                  <Td className="tabular-nums">{q.flagCount}</Td>
                  <Td><StatusBadge status={q.status} /></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Suspicious Candidate Behavior" subtitle="Behavior alerts and flagged live attempts" action={<DownloadBtn report="Security — Suspicious Behavior" />} />
          <Table>
            <thead><tr><Th>Alert</Th><Th>Subject</Th><Th>Severity</Th><Th>Status</Th></tr></thead>
            <tbody>
              {behaviorAlerts.map((a) => (
                <tr key={a.id}>
                  <Td className="text-navy-700">{a.message}</Td>
                  <Td className="font-mono text-xs">{a.subjectId}</Td>
                  <Td><RiskBadge level={a.severity} /></Td>
                  <Td><StatusBadge status={a.status} /></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
        <Card>
          <CardHeader title="Audit Log Summary" subtitle="Event counts by action across the trail" action={<DownloadBtn report="Security — Audit Log Summary" />} />
          <Table>
            <thead><tr><Th>Action</Th><Th className="text-right">Events</Th></tr></thead>
            <tbody>
              {auditSummary.map(([action, count]) => (
                <tr key={action}>
                  <Td>{titleCase(action)}</Td>
                  <Td className="text-right tabular-nums font-medium text-navy-800">{count}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="User Access Review" subtitle="Roles, MFA posture, and last login" action={<DownloadBtn report="Security — User Access Review" />} />
          <Table>
            <thead><tr><Th>User</Th><Th>Role</Th><Th>MFA</Th><Th>Last Login</Th></tr></thead>
            <tbody>
              {USERS.map((u) => (
                <tr key={u.id}>
                  <Td className="font-medium text-navy-800">{masked ? titleCase(u.roleKey) : u.fullName}</Td>
                  <Td>{titleCase(u.roleKey)}</Td>
                  <Td><Badge tone={u.mfaEnabled ? "green" : "red"}>{u.mfaEnabled ? "Enabled" : "Disabled"}</Badge></Td>
                  <Td className="text-navy-500">{dateTime(u.lastLoginAt)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
        <Card>
          <CardHeader title="Export Requests" subtitle="Maker-checker approval queue for sensitive exports" action={<DownloadBtn report="Security — Export Requests" />} />
          <Table>
            <thead><tr><Th>Request</Th><Th>Requested by</Th><Th>Checker</Th><Th>Status</Th></tr></thead>
            <tbody>
              {exportQueue.map((e) => (
                <tr key={e.id}>
                  <Td className="text-navy-700">{e.item}</Td>
                  <Td>{userName(e.requestedBy)}</Td>
                  <Td>{userName(e.checker)}</Td>
                  <Td><StatusBadge status={e.status} /></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>
    </div>
  );
}

/* ============================ E. CANDIDATE ================================ */
function CandidateTab() {
  // Employer-level pass-rate performance
  const empMap = new Map<string, { pass: number; total: number }>();
  for (const r of RESULTS) {
    const cand = CANDIDATES.find((c) => c.id === r.candidateId);
    if (!cand) continue;
    const cur = empMap.get(cand.employer) ?? { pass: 0, total: 0 };
    cur.total += 1; if (r.passed) cur.pass += 1;
    empMap.set(cand.employer, cur);
  }
  const employerPerf = [...empMap.entries()]
    .map(([label, { pass, total }]) => ({ label, value: Math.round((pass / total) * 100) }))
    .sort((a, b) => b.value - a.value);

  const retakers = CANDIDATES.filter((c) => c.attempts > 1);

  const appealsByCategory = new Map<string, number>();
  for (const a of APPEALS) appealsByCategory.set(a.category, (appealsByCategory.get(a.category) ?? 0) + 1);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Individual Score Report (sample)" subtitle="Candidates receive a domain-level scaled score report" action={<DownloadBtn report="Candidate — Individual Score Report" />} />
        <div className="p-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-navy-600 max-w-xl">
            Each candidate receives a personal score report with overall result, scaled score, and per-domain breakdown.
            Individual reports honour candidate PII permissions and are not aggregated here.
          </p>
          <Button variant="secondary" href="/results">View sample results →</Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Employer-level Performance" subtitle="Pass rate by candidate employer (%)" action={<DownloadBtn report="Candidate — Employer Performance" />} />
          <SectionBody><BarChart data={employerPerf} unit="%" color={C.teal} /></SectionBody>
        </Card>
        <Card>
          <CardHeader title="Retake Analysis" subtitle="Candidates with more than one attempt" action={<DownloadBtn report="Candidate — Retake Analysis" />} />
          <Table>
            <thead><tr><Th>Candidate</Th><Th>Certification</Th><Th>Attempts</Th><Th>Eligibility</Th></tr></thead>
            <tbody>
              {retakers.map((c) => (
                <tr key={c.id}>
                  <Td className="font-medium text-navy-800">{c.fullName}</Td>
                  <Td>{certCode(c.certificationId)}</Td>
                  <Td><Badge tone={c.attempts >= 3 ? "amber" : "gray"}>{c.attempts}</Badge></Td>
                  <Td><StatusBadge status={c.eligibilityStatus} /></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Certificate Status" subtitle="Issued certificates and renewal posture" action={<DownloadBtn report="Candidate — Certificate Status" />} />
          <Table>
            <thead><tr><Th>Certificate No.</Th><Th>Certification</Th><Th>Valid To</Th><Th>Status</Th><Th>Renewal</Th></tr></thead>
            <tbody>
              {CERTIFICATES.map((crt) => (
                <tr key={crt.id}>
                  <Td className="font-mono text-xs text-navy-800">{crt.certificateNo}</Td>
                  <Td>{certName(crt.certificationId)}</Td>
                  <Td>{shortDate(crt.validTo)}</Td>
                  <Td><StatusBadge status={crt.status} /></Td>
                  <Td><StatusBadge status={crt.renewalStatus} /></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
        <Card>
          <CardHeader title="Appeals & Complaints Summary" subtitle="By category and current status" action={<DownloadBtn report="Candidate — Appeals & Complaints" />} />
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {[...appealsByCategory.entries()].map(([cat, n]) => (
                <div key={cat} className="rounded-lg bg-navy-50/60 px-3 py-2">
                  <p className="text-[11px] text-navy-400">{titleCase(cat)}</p>
                  <p className="text-lg font-semibold text-navy-800 tabular-nums">{n}</p>
                </div>
              ))}
            </div>
            <Table>
              <thead><tr><Th>Appeal</Th><Th>Category</Th><Th>Status</Th></tr></thead>
              <tbody>
                {APPEALS.map((a) => (
                  <tr key={a.id}>
                    <Td className="font-mono text-xs text-navy-800">{a.appealNo}</Td>
                    <Td>{titleCase(a.category)}</Td>
                    <Td><StatusBadge status={a.status} /></Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
