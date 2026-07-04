"use client";
import { useMemo, useState } from "react";
import { PageHeader, Card, Kpi, StatusBadge, Table, Th, Td, InfoBanner, Button } from "@/components/ui";
import { CERTIFICATES, CANDIDATES } from "@/data/seed";
import { certName, shortDate } from "@/lib/format";
import { Icon } from "@/components/Icon";

/** Deterministic QR-like placeholder square (no real encoding). */
function QrSquare({ seed, size = 40 }: { seed: string; size?: number }) {
  const n = 7;
  const cells: boolean[] = [];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0xffff;
  for (let i = 0; i < n * n; i++) {
    h = (h * 1103515245 + 12345) & 0x7fffffff;
    cells.push((h >> 8) % 2 === 0);
  }
  const s = size / n;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-sm ring-1 ring-navy-200" role="img" aria-label="QR placeholder">
      <rect width={size} height={size} fill="#fff" />
      {cells.map((on, i) => on && (
        <rect key={i} x={(i % n) * s} y={Math.floor(i / n) * s} width={s} height={s} fill="#0f2544" />
      ))}
    </svg>
  );
}

export default function CertificatesPage() {
  const [status, setStatus] = useState("all");

  const rows = useMemo(() => CERTIFICATES.filter((c) => status === "all" || c.status === status), [status]);

  const issued = CERTIFICATES.length;
  const valid = CERTIFICATES.filter((c) => c.status === "valid").length;
  const revoked = CERTIFICATES.filter((c) => c.status === "revoked").length;
  const renewalsDue = CERTIFICATES.filter((c) => c.renewalStatus === "due" || c.renewalStatus === "overdue").length;

  return (
    <div>
      <PageHeader
        title="Certificate Issuance & Management"
        subtitle="Issue, verify, renew and revoke professional certificates. Every action is auditable."
        actions={<Button variant="secondary"><Icon name="award" className="w-4 h-4" />Issue certificate</Button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Kpi label="Issued" value={issued} tone="navy" />
        <Kpi label="Valid" value={valid} tone="green" />
        <Kpi label="Revoked" value={revoked} tone="red" />
        <Kpi label="Renewals Due" value={renewalsDue} tone="gold" />
      </div>

      <InfoBanner tone="teal">
        <span className="font-medium">Placeholders.</span> The public verification portal (QR scan → live validity check) and the revocation workflow are represented here as placeholders. Revocation is a maker-checker action requiring certification-manager sign-off.
      </InfoBanner>

      <Card className="mt-5">
        <div className="flex flex-wrap items-center gap-2 p-4 border-b border-navy-100">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-navy-200 bg-white text-sm py-2 px-2.5">
            <option value="all">All statuses</option>
            {["valid", "expired", "revoked"].map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
        <Table>
          <thead>
            <tr>
              <Th>Certificate No.</Th><Th>Candidate</Th><Th>Certification</Th><Th>Issued</Th><Th>Valid to</Th><Th>Status</Th><Th>Renewal</Th><Th>Verify</Th><Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const cand = CANDIDATES.find((x) => x.id === c.candidateId);
              return (
                <tr key={c.id} className="hover:bg-navy-50/60">
                  <Td className="font-mono text-[12px] font-medium text-navy-700">{c.certificateNo}</Td>
                  <Td className="text-navy-600">{cand ? cand.fullName : "—"}</Td>
                  <Td>{certName(c.certificationId)}</Td>
                  <Td className="whitespace-nowrap text-navy-600">{shortDate(c.issuedAt)}</Td>
                  <Td className="whitespace-nowrap text-navy-600">{shortDate(c.validTo)}</Td>
                  <Td><StatusBadge status={c.status} /></Td>
                  <Td><StatusBadge status={c.renewalStatus} /></Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <QrSquare seed={c.certificateNo} />
                      <span className="text-[10px] text-navy-400 leading-tight max-w-[110px]">QR verification portal — placeholder</span>
                    </div>
                  </Td>
                  <Td>
                    <div className="flex items-center justify-end gap-1.5">
                      <Button variant="ghost"><Icon name="certificate" className="w-4 h-4" />Download</Button>
                      <Button variant="ghost"><Icon name="search" className="w-4 h-4" />Verify</Button>
                      <Button variant="danger" disabled={c.status === "revoked"}><Icon name="x" className="w-4 h-4" />Revoke</Button>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        <div className="px-4 py-3 text-xs text-navy-400">Revoke requires a second approver (maker-checker). Showing {rows.length} of {issued} certificates.</div>
      </Card>
    </div>
  );
}
