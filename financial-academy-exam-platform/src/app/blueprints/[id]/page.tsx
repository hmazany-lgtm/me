"use client";
import { useState } from "react";
import { notFound } from "next/navigation";
import { PageHeader, Card, CardHeader, Kpi, Badge, StatusBadge, Table, Th, Td, InfoBanner, Button } from "@/components/ui";
import { Donut, Meter } from "@/components/charts";
import { BLUEPRINTS } from "@/data/seed";
import { certName, certCode, titleCase, num, userName, shortDate } from "@/lib/format";
import { blueprintReadiness } from "@/lib/analytics";
import { Icon } from "@/components/Icon";

const READINESS_LABEL: Record<string, string> = { green: "Sufficient", amber: "Limited", red: "Insufficient" };
const OVERALL_LABEL: Record<string, string> = { green: "Ready for assembly", amber: "Supply at risk", red: "Not ready — supply gap" };
const BANNER_TONE: Record<string, "teal" | "amber" | "rose"> = { green: "teal", amber: "amber", red: "rose" };

export default function BlueprintDetailPage({ params }: { params: { id: string } }) {
  const bp = BLUEPRINTS.find((b) => b.id === params.id);
  const [validated, setValidated] = useState(false);
  if (!bp) notFound();

  const readiness = blueprintReadiness(bp);
  const shortfall = readiness.domains.filter((d) => d.availableActive < d.minActiveQuestions);

  return (
    <div>
      <PageHeader
        title={`Blueprint — ${certName(bp.certificationId)}`}
        subtitle={`${certCode(bp.certificationId)} · version ${bp.version} · ${num(bp.totalQuestions)} items per form`}
        actions={
          <>
            <StatusBadge status={bp.status} />
            <Button variant="secondary" href={`/certifications/${bp.certificationId}`}><Icon name="certificate" className="w-4 h-4" />Certification</Button>
            <Button variant="secondary" href="/blueprints"><Icon name="logout" className="w-4 h-4" />Back</Button>
          </>
        }
      />

      <InfoBanner tone={BANNER_TONE[readiness.overall]}>
        <span className="font-medium">Blueprint readiness: {OVERALL_LABEL[readiness.overall]}.</span>{" "}
        {readiness.overall === "green"
          ? "Every domain holds enough approved active items to assemble compliant forms."
          : `${shortfall.length} domain(s) fall below the minimum active-item threshold. Item development should be prioritised before publishing new forms.`}
        {bp.approvedBy && ` Approved by ${userName(bp.approvedBy)}${bp.approvedAt ? ` on ${shortDate(bp.approvedAt)}` : ""}.`}
      </InfoBanner>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-5">
        <Kpi label="Total Items" value={num(bp.totalQuestions)} tone="navy" />
        <Kpi label="Domains" value={bp.domains.length} tone="teal" />
        <Kpi label="Available Active" value={num(bp.domains.reduce((s, d) => s + d.availableActive, 0))} tone="green" />
        <Kpi label="Minimum Required" value={num(bp.domains.reduce((s, d) => s + d.minActiveQuestions, 0))} tone="gold" />
      </div>

      <div className="grid md:grid-cols-2 gap-5 mb-5">
        <Card className="p-5">
          <CardHeader title="Difficulty mix" subtitle="Target distribution" />
          <div className="pt-4"><Donut data={Object.entries(bp.difficultyMix).map(([k, v]) => ({ label: titleCase(k), value: v }))} centerLabel="Target %" /></div>
        </Card>
        <Card className="p-5">
          <CardHeader title="Cognitive mix" subtitle="Bloom-level distribution" />
          <div className="pt-4"><Donut data={Object.entries(bp.cognitiveMix).map(([k, v]) => ({ label: titleCase(k), value: v }))} centerLabel="Target %" /></div>
        </Card>
      </div>

      <Card className="mb-5">
        <CardHeader
          title="Domain composition & readiness"
          subtitle="Weighting, item supply, and minimum active-item thresholds"
          action={<Button variant="primary" onClick={() => setValidated(true)}><Icon name="shield" className="w-4 h-4" />Validate against question bank</Button>}
        />
        {validated && (
          <div className="px-5 pt-4">
            <InfoBanner tone={shortfall.length ? "rose" : "teal"}>
              {shortfall.length
                ? `Validation failed: ${shortfall.length} domain(s) have fewer approved active items than the blueprint minimum (${shortfall.map((d) => d.name).join(", ")}). Forms cannot be certified until the shortfall is resolved.`
                : "Validation passed: sufficient approved active items exist in every domain to assemble compliant exam forms."}
            </InfoBanner>
          </div>
        )}
        <Table>
          <thead>
            <tr>
              <Th>Domain</Th>
              <Th className="w-48">Weight</Th>
              <Th className="text-right">Items on form</Th>
              <Th className="text-right">Min active</Th>
              <Th className="text-right">Available</Th>
              <Th>Readiness</Th>
            </tr>
          </thead>
          <tbody>
            {readiness.domains.map((d) => (
              <tr key={d.name}>
                <Td className="font-medium text-navy-800">{d.name}</Td>
                <Td><Meter value={d.weightPct} tone="navy" label={`${d.weightPct}%`} /></Td>
                <Td className="text-right tabular-nums">{d.questionCount}</Td>
                <Td className="text-right tabular-nums">{d.minActiveQuestions}</Td>
                <Td className={`text-right tabular-nums ${d.availableActive < d.minActiveQuestions ? "text-rose-600 font-medium" : ""}`}>{d.availableActive}</Td>
                <Td><Badge tone={d.status}>{READINESS_LABEL[d.status]}</Badge></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
