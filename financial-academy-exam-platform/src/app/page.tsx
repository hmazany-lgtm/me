"use client";
import { useMemo, useState } from "react";
import { Card, CardHeader, Kpi, PageHeader, Badge, StatusBadge, Table, Th, Td, InfoBanner } from "@/components/ui";
import { BarChart, GroupedBar, Donut, LineChart, Meter, Sparkline } from "@/components/charts";
import { CERTIFICATIONS, CENTERS, SESSIONS, CANDIDATES, QUESTIONS, SECURITY_ALERTS, RESULTS } from "@/data/seed";
import { sar, num, certCode, centerName } from "@/lib/format";
import { useSession } from "@/lib/session";
import { computeBankHealth } from "@/lib/analytics";
import Link from "next/link";

const DELIVERY = ["All methods", "Physical center", "Remote proctoring", "Blended", "Third-party hosted"];

export default function Dashboard() {
  const { user } = useSession();
  const [certFilter, setCertFilter] = useState("all");
  const [delivery, setDelivery] = useState("All methods");

  const activeCerts = CERTIFICATIONS.filter((c) => c.status === "active");
  const filtered = certFilter === "all" ? activeCerts : activeCerts.filter((c) => c.id === certFilter);

  const totals = useMemo(() => {
    const candidates = CANDIDATES.length;
    const revenue = CERTIFICATIONS.reduce((s, c) => s + c.stats.revenue, 0);
    const results = RESULTS.filter((r) => r.status === "released" || r.status === "approved");
    const passRate = results.length ? Math.round((results.filter((r) => r.passed).length / results.length) * 100) : 0;
    const avgScore = results.length ? Math.round(results.reduce((s, r) => s + r.scaledScore, 0) / results.length) : 0;
    const utilization = Math.round((CENTERS.reduce((s, c) => s + c.seatsBooked, 0) / CENTERS.reduce((s, c) => s + c.capacity, 0)) * 100);
    return { candidates, revenue, passRate, avgScore, utilization };
  }, []);

  const health = computeBankHealth(QUESTIONS);
  const openAlerts = SECURITY_ALERTS.filter((a) => a.status === "open");

  const passFailData = filtered.map((c) => ({ label: certCode(c.id), values: [c.stats.passRate, c.stats.failRate, c.stats.noShowRate] }));
  const revenueByCert = filtered.map((c) => ({ label: certCode(c.id), value: Math.round(c.stats.revenue / 1000) }));
  const trend = [
    { label: "Jan", value: 58 }, { label: "Feb", value: 61 }, { label: "Mar", value: 64 },
    { label: "Apr", value: 62 }, { label: "May", value: 68 }, { label: "Jun", value: 71 },
  ];

  return (
    <div>
      <PageHeader
        title="Executive Dashboard"
        subtitle={`Portfolio-level view of certification performance, operations, and exam security. Signed in as ${user.fullName}.`}
        actions={
          <div className="flex flex-wrap gap-2">
            <select value={certFilter} onChange={(e) => setCertFilter(e.target.value)} className="rounded-lg border border-navy-200 bg-white text-sm py-1.5 px-2.5">
              <option value="all">All certifications</option>
              {activeCerts.map((c) => <option key={c.id} value={c.id}>{c.code}</option>)}
            </select>
            <select value={delivery} onChange={(e) => setDelivery(e.target.value)} className="rounded-lg border border-navy-200 bg-white text-sm py-1.5 px-2.5">
              {DELIVERY.map((d) => <option key={d}>{d}</option>)}
            </select>
            <select className="rounded-lg border border-navy-200 bg-white text-sm py-1.5 px-2.5" defaultValue="YTD 2026">
              <option>YTD 2026</option><option>Q2 2026</option><option>Last 30 days</option>
            </select>
          </div>
        }
      />

      {user.roleKey === "executive" && (
        <div className="mb-4">
          <InfoBanner tone="teal">Executive view — figures are aggregated. Individual exam content, correct answers, and candidate PII are never exposed at this level.</InfoBanner>
        </div>
      )}

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-3">
        <Kpi label="Active Certifications" value={activeCerts.length} hint="of 5 total products" tone="navy" />
        <Kpi label="Exam Sessions" value={SESSIONS.length} delta="+2 wk" hint="1 active now" tone="teal" />
        <Kpi label="Registered Candidates" value={num(totals.candidates)} delta="+8%" tone="navy" />
        <Kpi label="Avg Pass Rate" value={`${totals.passRate}%`} delta="+3pt" tone="green" />
        <Kpi label="Avg Score" value={totals.avgScore} hint="scaled" tone="navy" />
        <Kpi label="Center Utilization" value={`${totals.utilization}%`} tone="teal" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        <Kpi label="No-show Rate" value="7%" delta="-1pt" tone="green" />
        <Kpi label="Exam Revenue" value={sar(totals.revenue)} delta="+12%" tone="gold" />
        <Kpi label="Bank Health" value={`${health.score}/100`} hint={health.band} tone={health.score >= 75 ? "green" : health.score >= 55 ? "gold" : "red"} />
        <Kpi label="Flagged Questions" value={QUESTIONS.filter((q) => q.flagCount > 0).length} tone="gold" />
        <Kpi label="Security Incidents" value={openAlerts.length} hint="open alerts" tone={openAlerts.length ? "red" : "green"} />
        <Kpi label="Satisfaction" value="4.4 / 5" delta="+0.2" tone="teal" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Pass / Fail / No-show by Certification" subtitle="Drill down by clicking a certification below" />
          <div className="p-5">
            <GroupedBar data={passFailData} series={[{ name: "Pass %", color: "#0e7c86" }, { name: "Fail %", color: "#e11d48" }, { name: "No-show %", color: "#c9a24b" }]} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Delivery Method Mix" subtitle="Sessions by channel" />
          <div className="p-5">
            <Donut
              centerValue={`${SESSIONS.length}`}
              centerLabel="Sessions"
              data={[
                { label: "Physical center", value: SESSIONS.filter((s) => s.deliveryMethod === "center").length, color: "#1f3a5c" },
                { label: "Remote proctoring", value: SESSIONS.filter((s) => s.deliveryMethod === "remote").length, color: "#0e7c86" },
                { label: "Blended", value: SESSIONS.filter((s) => s.deliveryMethod === "blended").length, color: "#c9a24b" },
                { label: "Third-party", value: SESSIONS.filter((s) => s.deliveryMethod === "third_party").length, color: "#4f719b" },
              ]}
            />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Pass-rate Trend" subtitle="Rolling 6 months — portfolio average" />
          <div className="p-5"><LineChart data={trend} unit="%" /></div>
        </Card>
        <Card>
          <CardHeader title="Revenue by Certification" subtitle="SAR thousands, YTD" />
          <div className="p-5"><BarChart data={revenueByCert} unit="k" color="#c9a24b" /></div>
        </Card>
      </div>

      {/* Operational risk + center utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader title="Operational Risk Indicators" subtitle="Cross-cutting risk signals" action={<Link href="/security" className="text-xs text-teal-600 font-medium">Security Center →</Link>} />
          <div className="p-5 space-y-3">
            {[
              { label: "Question exposure risk", value: 34, tone: "amber" as const },
              { label: "Exam form leakage risk", value: 22, tone: "red" as const },
              { label: "Item quality risk (low discrimination)", value: 18, tone: "amber" as const },
              { label: "Candidate behavior anomalies", value: 12, tone: "amber" as const },
              { label: "Operational SLA compliance", value: 94, tone: "green" as const },
            ].map((r) => <Meter key={r.label} label={r.label} value={r.value} tone={r.tone} />)}
          </div>
        </Card>
        <Card>
          <CardHeader title="Exam Center Utilization" subtitle="Seats booked vs capacity" action={<Link href="/centers" className="text-xs text-teal-600 font-medium">Centers →</Link>} />
          <Table>
            <thead><tr><Th>Center</Th><Th>City</Th><Th>Occupancy</Th><Th className="text-right">Revenue YTD</Th></tr></thead>
            <tbody>
              {CENTERS.filter((c) => c.status !== "future").map((c) => (
                <tr key={c.id}>
                  <Td className="font-medium text-navy-800">{c.name}</Td>
                  <Td>{c.city}</Td>
                  <Td><div className="w-28"><Meter value={(c.seatsBooked / c.capacity) * 100} tone={c.seatsBooked / c.capacity > 0.7 ? "green" : "amber"} /></div></Td>
                  <Td className="text-right tabular-nums text-navy-600">{sar(c.revenueYtd)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>

      {/* Alerts + certification table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader title="Security & Integrity Alerts" subtitle={`${openAlerts.length} open`} action={<Link href="/security" className="text-xs text-teal-600 font-medium">All →</Link>} />
          <ul className="divide-y divide-navy-50">
            {openAlerts.slice(0, 5).map((a) => (
              <li key={a.id} className="px-5 py-3 flex gap-3">
                <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${a.severity === "critical" || a.severity === "high" ? "bg-rose-500" : "bg-amber-500"}`} />
                <div>
                  <p className="text-xs text-navy-700 leading-snug">{a.message}</p>
                  <p className="text-[10px] text-navy-400 mt-0.5">{a.type} · {a.subjectId}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title="Certification Portfolio" subtitle="Click a row to drill into a certification" />
          <Table>
            <thead><tr><Th>Certification</Th><Th>Candidates</Th><Th>Pass</Th><Th>Avg</Th><Th>Active Qs</Th><Th>Trend</Th><Th></Th></tr></thead>
            <tbody>
              {activeCerts.map((c) => (
                <tr key={c.id} className="hover:bg-navy-50/60">
                  <Td><Link href={`/certifications/${c.id}`} className="font-medium text-navy-800 hover:text-teal-600">{c.code}<span className="block text-[11px] text-navy-400 font-normal">{c.name}</span></Link></Td>
                  <Td className="tabular-nums">{c.stats.candidates}</Td>
                  <Td><Badge tone={c.stats.passRate >= 60 ? "green" : "amber"}>{c.stats.passRate}%</Badge></Td>
                  <Td className="tabular-nums">{c.stats.avgScore}</Td>
                  <Td className="tabular-nums">{c.stats.activeQuestions}</Td>
                  <Td><Sparkline data={[55, 60, 58, 64, 62, c.stats.passRate]} /></Td>
                  <Td><Link href={`/certifications/${c.id}`} className="text-teal-600 text-xs font-medium">View →</Link></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
