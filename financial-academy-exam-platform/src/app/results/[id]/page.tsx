"use client";
import { useState } from "react";
import { notFound } from "next/navigation";
import { PageHeader, Card, CardHeader, Badge, StatusBadge, Button, InfoBanner } from "@/components/ui";
import { BarChart, Meter } from "@/components/charts";
import { Icon } from "@/components/Icon";
import { RESULTS, CANDIDATES, CERTIFICATIONS, CERTIFICATES } from "@/data/seed";
import { certName, userName, dateTime } from "@/lib/format";
import { useSession } from "@/lib/session";
import { can } from "@/lib/permissions";
import type { ResultStatus } from "@/lib/types";

export default function ResultDetail({ params }: { params: { id: string } }) {
  const { user, logAccess } = useSession();
  const result = RESULTS.find((r) => r.id === params.id);
  const [localStatus, setLocalStatus] = useState<ResultStatus | null>(null);
  const [released, setReleased] = useState(false);

  if (!result) return notFound();

  const status = localStatus ?? result.status;
  const cand = CANDIDATES.find((c) => c.id === result.candidateId);
  const cert = CERTIFICATIONS.find((c) => c.id === result.certificationId);
  const certificate = CERTIFICATES.find((c) => c.resultId === result.id);
  const mayRelease = can(user.roleKey, "release_result");
  const isReleased = status === "released";

  const handleRelease = () => {
    logAccess({ action: "result_released", object: result.id, risk: "high" });
    setLocalStatus("released");
    setReleased(true);
  };
  const handleHold = () => setLocalStatus("held");
  const handleInvalidate = () => setLocalStatus("invalidated");

  const domainData = result.domainScores.map((d) => ({ label: d.domain, value: d.score }));

  return (
    <div>
      <PageHeader
        title={`Score report · ${cand?.fullName ?? result.candidateId}`}
        subtitle={`${certName(result.certificationId)} · Result ${result.id}`}
        actions={<Button variant="secondary" href="/results"><Icon name="report" className="w-4 h-4" />All results</Button>}
      />

      {/* Big pass/fail banner */}
      <div className={`rounded-xl border p-6 mb-4 flex items-center justify-between gap-4 ${result.passed ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}>
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-full grid place-items-center text-white ${result.passed ? "bg-emerald-500" : "bg-rose-500"}`}>
            <Icon name={result.passed ? "check" : "x"} className="w-8 h-8" />
          </div>
          <div>
            <p className={`text-2xl font-bold ${result.passed ? "text-emerald-700" : "text-rose-700"}`}>{result.passed ? "PASS" : "DID NOT PASS"}</p>
            <p className="text-sm text-navy-500">Scaled score {result.scaledScore} · passing mark {result.passingScore}</p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {status !== "released" && (
        <InfoBanner tone="amber">
          <span className="font-medium">Result held — pending approval.</span> This outcome is <span className="font-semibold">not yet visible to the candidate</span>. It requires a maker-checker release before publication.
        </InfoBanner>
      )}
      {released && (
        <InfoBanner tone="teal">
          <span className="font-medium">Released.</span> The result has been approved and published to the candidate. A high-risk <code>result_released</code> event was written to the audit trail against {user.fullName}.
        </InfoBanner>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Score gauge */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-navy-800 mb-3">Overall score</h3>
            <Meter value={result.scaledScore} tone={result.passed ? "green" : "red"} label={`Scaled score vs passing mark (${result.passingScore})`} />
            <div className="flex justify-between text-[11px] text-navy-400 mt-1.5">
              <span>Raw: {result.rawScore}</span>
              <span>Scaled: <span className="font-semibold text-navy-700">{result.scaledScore}</span></span>
              <span>Required: {result.passingScore}</span>
            </div>
          </Card>

          {/* Domain-level performance */}
          <Card>
            <CardHeader title="Domain-level performance" subtitle="Percentage correct by content domain" />
            <div className="p-5">
              <BarChart data={domainData} unit="%" />
            </div>
          </Card>

          <InfoBanner tone="blue">
            <span className="font-medium">No secure content in reports.</span> The candidate score report shows domain-level performance only — it never reveals individual questions, options or correct-answer keys. This protects item security and the exam bank.
          </InfoBanner>
        </div>

        {/* Controls sidebar */}
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-navy-800 mb-3">Result controls</h3>
            <dl className="space-y-2.5 text-sm">
              <Row label="Status" value={<StatusBadge status={status} />} />
              <Row label="Approved by" value={result.approvedBy ? userName(result.approvedBy) : "—"} />
              <Row label="Released by" value={result.releasedBy ? userName(result.releasedBy) : released ? user.fullName : "—"} />
              <Row label="Released at" value={result.releasedAt ? dateTime(result.releasedAt) : released ? "Just now" : "—"} />
            </dl>

            <div className="mt-4 pt-4 border-t border-navy-100 space-y-2">
              {mayRelease ? (
                <>
                  <Button variant="primary" className="w-full justify-center" onClick={handleRelease} disabled={isReleased}>
                    <Icon name="check" className="w-4 h-4" />{isReleased ? "Released" : "Approve & Release"}
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="secondary" className="flex-1 justify-center" onClick={handleHold} disabled={status === "held"}>Hold</Button>
                    <Button variant="danger" className="flex-1 justify-center" onClick={handleInvalidate} disabled={status === "invalidated"}>Invalidate</Button>
                  </div>
                  <p className="text-[10px] text-navy-400">Release records the approving officer (maker-checker). Hold / Invalidate route the result to investigation.</p>
                </>
              ) : (
                <>
                  <Button variant="secondary" className="w-full justify-center" disabled><Icon name="lock" className="w-4 h-4" />Release restricted</Button>
                  <p className="text-[10px] text-navy-400">Your role can view this report but cannot approve, release, hold or invalidate results.</p>
                </>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-navy-800 mb-2">Retake eligibility</h3>
            <p className="text-xs text-navy-500">
              {result.passed
                ? "Passed — no retake required. Certification validity begins on issuance."
                : `A retake is permitted after the mandatory wait period${cert ? ` of ${cert.retakeWaitDays} days` : ""}. A retake fee${cert ? ` of ${cert.retakeFee} SAR` : ""} applies.`}
            </p>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-navy-800 mb-2">Certificate</h3>
            {result.passed && isReleased ? (
              <>
                <p className="text-xs text-navy-500 mb-3">Candidate is eligible for certificate issuance.</p>
                <Button variant="secondary" href="/certifications" className="w-full justify-center">
                  <Icon name="award" className="w-4 h-4" />{certificate ? `Certificate ${certificate.certificateNo}` : "Issue certificate"}
                </Button>
              </>
            ) : (
              <p className="text-xs text-navy-400">
                {result.passed
                  ? "Certificate issuance is available once the result is released."
                  : "No certificate — the candidate did not meet the passing standard."}
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center gap-3">
      <dt className="text-navy-400">{label}</dt>
      <dd className="font-medium text-navy-700">{value}</dd>
    </div>
  );
}
