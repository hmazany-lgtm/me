"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, Card, CardHeader, Kpi, Badge, StatusBadge, Table, Th, Td, InfoBanner, Button } from "@/components/ui";
import { BarChart, Donut, LineChart, Meter } from "@/components/charts";
import { CERTIFICATIONS, BLUEPRINTS, QUESTIONS, EXAM_FORMS, SECURITY_ALERTS } from "@/data/seed";
import { sar, pct, num, titleCase, userName, shortDate } from "@/lib/format";
import { computeBankHealth, blueprintReadiness, itemRecommendation } from "@/lib/analytics";
import { Icon } from "@/components/Icon";

const TABS = [
  "Overview",
  "Blueprint",
  "Question Bank Status",
  "Candidate Statistics",
  "Pass/Fail Trends",
  "Item Analysis",
  "Security Notes",
  "Version History",
  "Approval Workflow",
] as const;

const READINESS_LABEL: Record<string, string> = { green: "Sufficient", amber: "Limited", red: "Insufficient" };

export default function CertificationDetailPage({ params }: { params: { id: string } }) {
  const cert = CERTIFICATIONS.find((c) => c.id === params.id);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  if (!cert) notFound();

  const blueprint = BLUEPRINTS.find((bp) => bp.certificationId === cert.id);
  const certQuestions = useMemo(() => QUESTIONS.filter((q) => q.certificationId === cert.id), [cert.id]);
  const certForms = EXAM_FORMS.filter((f) => f.certificationId === cert.id);
  const health = computeBankHealth(QUESTIONS, cert.id);
  const readiness = blueprint ? blueprintReadiness(blueprint) : null;

  const relatedFormIds = certForms.map((f) => f.id);
  const relatedQuestionIds = certQuestions.map((q) => q.id);
  const alerts = SECURITY_ALERTS.filter(
    (a) =>
      a.subjectId === cert.id ||
      relatedFormIds.includes(a.subjectId) ||
      relatedQuestionIds.includes(a.subjectId)
  );

  const statusCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const q of certQuestions) map[q.status] = (map[q.status] ?? 0) + 1;
    return map;
  }, [certQuestions]);

  // Plausible 6-month pass-rate trend anchored to the current pass rate.
  const trend = useMemo(() => {
    const base = cert.stats.passRate || 62;
    const wobble = [-6, 3, -2, 4, -3, 0];
    return ["Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((m, i) => ({
      label: m,
      value: Math.max(20, Math.min(98, base + wobble[i] + (i - 2))),
    }));
  }, [cert.stats.passRate]);

  const itemRows = certQuestions
    .filter((q) => ["active", "approved", "suspended"].includes(q.status))
    .slice(0, 8);

  const def = (label: string, value: React.ReactNode) => (
    <div className="py-2.5 border-b border-navy-50 last:border-0">
      <dt className="text-[11px] uppercase tracking-wide text-navy-400">{label}</dt>
      <dd className="text-sm text-navy-800 mt-0.5">{value}</dd>
    </div>
  );

  const workflowSteps = ["Draft", "Technical", "Psychometric", "Regulatory", "Committee", "Active"];
  const activeStepIndex = cert.status === "active" ? workflowSteps.length - 1 : cert.status === "draft" ? 0 : 4;

  return (
    <div>
      <PageHeader
        title={cert.name}
        subtitle={cert.description}
        actions={
          <>
            <Badge tone="gray">{cert.code}</Badge>
            <StatusBadge status={cert.status} />
            <Button variant="secondary" href="/certifications"><Icon name="logout" className="w-4 h-4" />Back</Button>
          </>
        }
      />

      <div className="flex flex-wrap gap-1.5 mb-5 border-b border-navy-100">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm font-medium rounded-t-md -mb-px border-b-2 transition ${
              tab === t ? "border-teal-600 text-teal-700" : "border-transparent text-navy-400 hover:text-navy-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="grid lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader title="Product definition" subtitle="Core certification parameters" />
            <dl className="px-5 py-2">
              {def("Regulator / Owner", cert.regulatorOwner)}
              {def("Target audience", cert.targetAudience)}
              {def("Delivery methods", <span className="flex flex-wrap gap-1">{cert.deliveryMethods.map((d) => <Badge key={d} tone="blue">{titleCase(d)}</Badge>)}</span>)}
              {def("Languages", <span className="flex flex-wrap gap-1">{cert.languages.map((l) => <Badge key={l} tone="teal">{l.toUpperCase()}</Badge>)}</span>)}
              {def("Allowed question types", <span className="flex flex-wrap gap-1">{cert.allowedQuestionTypes.map((t) => <Badge key={t} tone="gray">{titleCase(t)}</Badge>)}</span>)}
              {def("Required competencies", <span className="flex flex-wrap gap-1">{cert.requiredCompetencies.map((c) => <Badge key={c} tone="purple">{c}</Badge>)}</span>)}
              {def("Related programs", cert.relatedPrograms.join(", "))}
            </dl>
          </Card>
          <Card>
            <CardHeader title="Rules & commercials" subtitle="Scoring, validity, and fees" />
            <dl className="px-5 py-2">
              {def("Passing score", `${cert.passingScore}%`)}
              {def("Duration", `${cert.durationMinutes} minutes`)}
              {def("Question count (form length)", num(cert.questionCount))}
              {def("Validity", `${cert.validityMonths} months`)}
              {def("Retake policy", `Wait ${cert.retakeWaitDays} days · retake fee ${sar(cert.retakeFee)}`)}
              {def("Exam fee", sar(cert.examFee))}
              {def("Version", `v${cert.version}`)}
            </dl>
          </Card>
        </div>
      )}

      {tab === "Blueprint" && (
        blueprint ? (
          <div className="space-y-5">
            <Card>
              <CardHeader title="Domain weighting" subtitle="Blueprint distribution of marks across domains" />
              <div className="p-5">
                <BarChart data={blueprint.domains.map((d) => ({ label: d.name, value: d.weightPct }))} unit="%" />
              </div>
            </Card>
            <div className="grid md:grid-cols-2 gap-5">
              <Card className="p-5">
                <CardHeader title="Difficulty mix" />
                <div className="pt-4"><Donut data={Object.entries(blueprint.difficultyMix).map(([k, v]) => ({ label: titleCase(k), value: v }))} centerLabel="Target %" /></div>
              </Card>
              <Card className="p-5">
                <CardHeader title="Cognitive mix" />
                <div className="pt-4"><Donut data={Object.entries(blueprint.cognitiveMix).map(([k, v]) => ({ label: titleCase(k), value: v }))} centerLabel="Target %" /></div>
              </Card>
            </div>
            <Card>
              <CardHeader title="Domain readiness" subtitle="Available active items vs blueprint minimum" action={<Button variant="secondary" href={`/blueprints/${blueprint.id}`}><Icon name="blueprint" className="w-4 h-4" />Open blueprint</Button>} />
              <Table>
                <thead><tr><Th>Domain</Th><Th className="text-right">Weight</Th><Th className="text-right">Available</Th><Th className="text-right">Minimum</Th><Th>Readiness</Th></tr></thead>
                <tbody>
                  {readiness!.domains.map((d) => (
                    <tr key={d.name}>
                      <Td className="font-medium text-navy-800">{d.name}</Td>
                      <Td className="text-right tabular-nums">{d.weightPct}%</Td>
                      <Td className="text-right tabular-nums">{d.availableActive}</Td>
                      <Td className="text-right tabular-nums">{d.minActiveQuestions}</Td>
                      <Td><Badge tone={d.status}>{READINESS_LABEL[d.status]}</Badge></Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </div>
        ) : (
          <InfoBanner tone="amber">No blueprint has been defined for this certification yet.</InfoBanner>
        )
      )}

      {tab === "Question Bank Status" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Kpi label="Total Items" value={certQuestions.length} tone="navy" />
            <Kpi label="Active" value={statusCounts["active"] ?? 0} tone="green" />
            <Kpi label="Under Review" value={statusCounts["under_review"] ?? 0} tone="gold" />
            <Kpi label="Bank Health" value={health.score} hint={health.band} tone={health.score >= 75 ? "green" : health.score >= 50 ? "gold" : "red"} />
          </div>
          <Card>
            <CardHeader title="Items by status" />
            <Table>
              <thead><tr><Th>Status</Th><Th className="text-right">Count</Th><Th>Share</Th></tr></thead>
              <tbody>
                {Object.entries(statusCounts).sort((a, b) => b[1] - a[1]).map(([s, n]) => (
                  <tr key={s}>
                    <Td><StatusBadge status={s} /></Td>
                    <Td className="text-right tabular-nums">{n}</Td>
                    <Td className="w-40"><Meter value={(n / (certQuestions.length || 1)) * 100} tone="teal" /></Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
          <Card>
            <CardHeader title="Recommendations" subtitle={`Composite bank-health score: ${health.score}/100 (${health.band})`} />
            <ul className="px-5 py-4 space-y-2">
              {health.recommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-navy-700">
                  <Icon name="check" className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />{r}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {tab === "Candidate Statistics" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <Kpi label="Candidates" value={num(cert.stats.candidates)} tone="navy" />
          <Kpi label="Pass Rate" value={pct(cert.stats.passRate)} tone="green" />
          <Kpi label="Fail Rate" value={pct(cert.stats.failRate)} tone="red" />
          <Kpi label="No-show Rate" value={pct(cert.stats.noShowRate)} tone="gold" />
          <Kpi label="Average Score" value={cert.stats.avgScore} hint="scaled" tone="teal" />
          <Kpi label="Active Questions" value={cert.stats.activeQuestions} tone="navy" />
          <Kpi label="Flagged Questions" value={cert.stats.flaggedQuestions} tone="gold" />
          <Kpi label="Revenue" value={sar(cert.stats.revenue)} tone="teal" />
        </div>
      )}

      {tab === "Pass/Fail Trends" && (
        <Card>
          <CardHeader title="Pass-rate trend" subtitle="Rolling six-month pass rate (%)" />
          <div className="p-5">
            <LineChart data={trend} unit="%" />
          </div>
          <div className="px-5 pb-4">
            <InfoBanner tone="blue">Trend blends historical sittings with the current cohort. Sustained deviation from baseline triggers a psychometric and security review.</InfoBanner>
          </div>
        </Card>
      )}

      {tab === "Item Analysis" && (
        <div className="space-y-4">
          <InfoBanner tone="teal">
            <span className="font-medium">Reports show item IDs and statistics only.</span> To honour the no-leak rule, question stems and answer keys are never rendered in analytics views — item performance is identified by ID.
          </InfoBanner>
          <Card>
            <CardHeader title="Item performance" subtitle="Difficulty (p-value) and discrimination index for sampled items" />
            <Table>
              <thead><tr><Th>Item ID</Th><Th>Domain</Th><Th className="text-right">Difficulty (p)</Th><Th className="text-right">Discrimination</Th><Th>Recommendation</Th></tr></thead>
              <tbody>
                {itemRows.map((q) => (
                  <tr key={q.id}>
                    <Td className="font-mono text-[13px] text-navy-700">{q.id}</Td>
                    <Td className="text-navy-600">{q.domain}</Td>
                    <Td className="text-right tabular-nums">{q.difficultyIndex.toFixed(2)}</Td>
                    <Td className={`text-right tabular-nums ${q.discriminationIndex < 0.15 ? "text-rose-600 font-medium" : ""}`}>{q.discriminationIndex.toFixed(2)}</Td>
                    <Td className="text-navy-600">{itemRecommendation(q)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </div>
      )}

      {tab === "Security Notes" && (
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <InfoBanner tone="teal">No open security alerts are currently associated with this certification, its forms, or its items.</InfoBanner>
          ) : (
            <Card>
              <CardHeader title="Related security alerts" subtitle="Exposure, leakage, and integrity signals for this certification" />
              <Table>
                <thead><tr><Th>Type</Th><Th>Severity</Th><Th>Subject</Th><Th>Message</Th><Th>Status</Th></tr></thead>
                <tbody>
                  {alerts.map((a) => (
                    <tr key={a.id}>
                      <Td>{titleCase(a.type)}</Td>
                      <Td><Badge tone={a.severity === "critical" || a.severity === "high" ? "red" : a.severity === "medium" ? "amber" : "green"}>{titleCase(a.severity)}</Badge></Td>
                      <Td className="font-mono text-[12px] text-navy-600">{a.subjectId}</Td>
                      <Td className="text-navy-600 max-w-md">{a.message}</Td>
                      <Td><StatusBadge status={a.status} /></Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          )}
        </div>
      )}

      {tab === "Version History" && (
        <Card>
          <CardHeader title="Version history" subtitle={`Change history through v${cert.version}`} />
          <Table>
            <thead><tr><Th>Version</Th><Th>Date</Th><Th>Approved by</Th><Th>Summary</Th></tr></thead>
            <tbody>
              {Array.from({ length: cert.version }, (_, i) => cert.version - i).map((v) => (
                <tr key={v}>
                  <Td><Badge tone={v === cert.version ? "green" : "gray"}>v{v}{v === cert.version ? " · current" : ""}</Badge></Td>
                  <Td className="text-navy-600">{shortDate(`2024-${String(((v * 3) % 12) + 1).padStart(2, "0")}-15`)}</Td>
                  <Td className="text-navy-600">{userName("u-committee")}</Td>
                  <Td className="text-navy-600">{v === 1 ? "Initial blueprint and item bank approved." : `Blueprint refresh and item-bank review for v${v}.`}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      {tab === "Approval Workflow" && (
        <Card>
          <CardHeader title="Governance approval workflow" subtitle="Maker-checker path from draft to active delivery" />
          <ol className="px-6 py-5 space-y-0">
            {workflowSteps.map((step, i) => {
              const done = i < activeStepIndex;
              const current = i === activeStepIndex;
              return (
                <li key={step} className="flex gap-3 pb-6 last:pb-0 relative">
                  {i < workflowSteps.length - 1 && <span className="absolute left-[11px] top-6 bottom-0 w-px bg-navy-100" />}
                  <span className={`z-10 grid place-items-center w-6 h-6 rounded-full text-white shrink-0 ${done ? "bg-emerald-600" : current ? "bg-teal-600" : "bg-navy-200"}`}>
                    {done ? <Icon name="check" className="w-3.5 h-3.5" /> : <span className="text-[11px] font-semibold">{i + 1}</span>}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-navy-800">{step} review</p>
                    <p className="text-xs text-navy-400">
                      {done ? "Completed" : current ? "In progress / current gate" : "Pending"}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>
      )}
    </div>
  );
}
