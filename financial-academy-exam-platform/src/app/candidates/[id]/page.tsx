"use client";
import { notFound } from "next/navigation";
import { PageHeader, Card, CardHeader, Badge, StatusBadge, Table, Th, Td, InfoBanner, Restricted } from "@/components/ui";
import { CANDIDATES, RESULTS, CERTIFICATES, APPEALS } from "@/data/seed";
import { certCode, certName, titleCase, shortDate, mask } from "@/lib/format";
import { useSession } from "@/lib/session";
import { can, canFull } from "@/lib/permissions";

export default function CandidateDetail({ params }: { params: { id: string } }) {
  const { user } = useSession();
  const candidate = CANDIDATES.find((c) => c.id === params.id);
  if (!candidate) return notFound();

  const mayView = can(user.roleKey, "view_candidate");
  const full = canFull(user.roleKey, "view_candidate");

  if (!mayView) {
    return (
      <div>
        <PageHeader title={candidate.fullName} subtitle="Candidate profile" />
        <Restricted message="Your role cannot view candidate records. This access attempt has been recorded." />
      </div>
    );
  }

  const results = RESULTS.filter((r) => r.candidateId === candidate.id);
  const certificates = CERTIFICATES.filter((c) => c.candidateId === candidate.id);
  const appeals = APPEALS.filter((a) => a.candidateId === candidate.id);

  return (
    <div>
      <PageHeader
        title={candidate.fullName}
        subtitle={`${certName(candidate.certificationId)} · ${candidate.employer} · ${candidate.city}`}
        actions={
          <>
            <StatusBadge status={candidate.eligibilityStatus} />
            <StatusBadge status={candidate.paymentStatus} />
          </>
        }
      />

      <div className="mb-4">
        <InfoBanner tone="blue">
          <span className="font-medium">Content protection.</span> Candidates never see secure question content after the exam. Score reports show domain-level performance only — item stems and keys remain restricted.
        </InfoBanner>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Exam history */}
          <Card>
            <CardHeader title="Exam history" subtitle="Results across all attempts" />
            {results.length === 0 ? (
              <p className="p-5 text-sm text-navy-400">No results recorded.</p>
            ) : (
              <Table>
                <thead><tr><Th>Certification</Th><Th className="text-right">Scaled score</Th><Th className="text-right">Passing</Th><Th>Outcome</Th><Th>Result status</Th></tr></thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.id} className="hover:bg-navy-50/60">
                      <Td><span title={certName(r.certificationId)}>{certCode(r.certificationId)}</span></Td>
                      <Td className="text-right tabular-nums font-medium">{r.scaledScore}</Td>
                      <Td className="text-right tabular-nums text-navy-400">{r.passingScore}</Td>
                      <Td><StatusBadge status={r.passed ? "passed" : "failed"} /></Td>
                      <Td><StatusBadge status={r.status} /></Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>

          {/* Certificates */}
          <Card>
            <CardHeader title="Certificates" subtitle="Issued credentials and validity" />
            {certificates.length === 0 ? (
              <p className="p-5 text-sm text-navy-400">No certificates issued.</p>
            ) : (
              <Table>
                <thead><tr><Th>Certificate No.</Th><Th>Certification</Th><Th>Issued</Th><Th>Valid to</Th><Th>Status</Th><Th>Renewal</Th></tr></thead>
                <tbody>
                  {certificates.map((c) => (
                    <tr key={c.id} className="hover:bg-navy-50/60">
                      <Td className="font-mono text-[12px] text-navy-600">{c.certificateNo}</Td>
                      <Td>{certCode(c.certificationId)}</Td>
                      <Td>{shortDate(c.issuedAt)}</Td>
                      <Td>{shortDate(c.validTo)}</Td>
                      <Td><StatusBadge status={c.status} /></Td>
                      <Td><StatusBadge status={c.renewalStatus} /></Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>

          {/* Appeals */}
          <Card>
            <CardHeader title="Appeals" subtitle="Formal disputes raised by this candidate" />
            {appeals.length === 0 ? (
              <p className="p-5 text-sm text-navy-400">No appeals on record.</p>
            ) : (
              <Table>
                <thead><tr><Th>Appeal No.</Th><Th>Category</Th><Th>SLA due</Th><Th>Status</Th><Th>Decision</Th></tr></thead>
                <tbody>
                  {appeals.map((a) => (
                    <tr key={a.id} className="hover:bg-navy-50/60">
                      <Td className="font-mono text-[12px] text-navy-600">{a.appealNo}</Td>
                      <Td>{titleCase(a.category)}</Td>
                      <Td>{shortDate(a.slaDue)}</Td>
                      <Td><StatusBadge status={a.status} /></Td>
                      <Td className="text-xs text-navy-500">{a.decision ?? "—"}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-navy-800 mb-3">Profile</h3>
            <dl className="space-y-2.5 text-sm">
              <Row label="National ID" value={full ? candidate.nationalId : mask(candidate.nationalId)} mono />
              <Row label="Email" value={full ? candidate.email : mask(candidate.email, 0)} />
              <Row label="Mobile" value={full ? candidate.mobile : mask(candidate.mobile, 2)} />
              <Row label="Employer" value={candidate.employer} />
              <Row label="Sector" value={candidate.sector} />
              <Row label="City" value={candidate.city} />
              <Row label="Attempts" value={String(candidate.attempts)} />
            </dl>
            {!full && <p className="text-[11px] text-navy-400 mt-3 pt-3 border-t border-navy-100">Personal identifiers are masked for your role.</p>}
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-navy-800 mb-3">Eligibility &amp; payment</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm"><span className="text-navy-400">Eligibility</span><StatusBadge status={candidate.eligibilityStatus} /></div>
              <div className="flex items-center justify-between text-sm"><span className="text-navy-400">Payment</span><StatusBadge status={candidate.paymentStatus} /></div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-navy-800 mb-3">Accommodations</h3>
            {candidate.accommodations.length === 0 ? (
              <p className="text-xs text-navy-400">None requested.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {candidate.accommodations.map((a) => <Badge key={a} tone="purple">{a}</Badge>)}
              </div>
            )}
          </Card>

          {candidate.misconductHistory.length > 0 && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-navy-800 mb-3">Misconduct history</h3>
              <ul className="space-y-2">
                {candidate.misconductHistory.map((m, i) => (
                  <li key={i} className="text-xs text-navy-600 border-l-2 border-rose-300 pl-2.5">
                    <span className="font-medium">{m.note}</span><span className="block text-navy-400">{shortDate(m.date)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-navy-400">{label}</dt>
      <dd className={`font-medium text-navy-700 ${mono ? "font-mono text-[12px]" : ""}`}>{value}</dd>
    </div>
  );
}
