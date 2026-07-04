"use client";
import { notFound } from "next/navigation";
import { PageHeader, Card, CardHeader, Badge, StatusBadge, Button, InfoBanner, Table, Th, Td } from "@/components/ui";
import { SESSIONS, CANDIDATES, VENDORS, INCIDENTS } from "@/data/seed";
import { certName, certCode, centerName, titleCase, shortDate, userName, mask } from "@/lib/format";
import { RiskBadge } from "@/components/ui";
import { Icon } from "@/components/Icon";

export default function SessionDetail({ params }: { params: { id: string } }) {
  const session = SESSIONS.find((s) => s.id === params.id);
  if (!session) return notFound();

  const vendor = session.vendorId ? VENDORS.find((v) => v.id === session.vendorId) : undefined;
  const roster = session.candidateIds.map((id) => CANDIDATES.find((c) => c.id === id)).filter(Boolean) as (typeof CANDIDATES)[number][];
  const incidents = INCIDENTS.filter((i) => i.sessionId === session.id);
  const booked = session.candidateIds.length;
  const isActive = session.status === "active";

  return (
    <div>
      <PageHeader
        title={`Session ${session.id}`}
        subtitle={`${certName(session.certificationId)} · ${centerName(session.centerId)} · ${session.room}`}
        actions={
          <>
            <StatusBadge status={session.status} />
            {isActive && <Button href="/invigilation"><Icon name="eye" className="w-4 h-4" />Open invigilation</Button>}
          </>
        }
      />

      {session.status === "under_investigation" && (
        <div className="mb-4">
          <InfoBanner tone="rose">
            <span className="font-medium">Security hold.</span> This session is under investigation. Results are withheld and the session record is locked pending review by the Security &amp; Integrity Committee. All access is audited.
          </InfoBanner>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Overview */}
          <Card>
            <CardHeader title="Session overview" subtitle="Delivery, scheduling and staffing" />
            <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <Field label="Certification" value={`${certCode(session.certificationId)} — ${certName(session.certificationId)}`} />
              <Field label="Exam form" value={session.formId} mono />
              <Field label="Date" value={shortDate(session.date)} />
              <Field label="Start time" value={session.startTime} />
              <Field label="Duration" value={`${session.durationMinutes} min`} />
              <Field label="Delivery" value={titleCase(session.deliveryMethod)} />
              <Field label="Center" value={centerName(session.centerId)} />
              <Field label="Room" value={session.room} />
              <Field label="Vendor" value={vendor ? vendor.name : "In-house"} />
              <div className="col-span-2 md:col-span-3">
                <p className="text-[11px] uppercase tracking-wide text-navy-400 mb-1">Invigilators</p>
                <div className="flex flex-wrap gap-1.5">
                  {session.invigilatorIds.map((id) => <Badge key={id} tone="teal">{userName(id)}</Badge>)}
                </div>
              </div>
            </div>
          </Card>

          {/* Roster */}
          <Card>
            <CardHeader title="Candidate roster" subtitle={`${roster.length} registered · national ID masked for PII protection`} />
            <Table>
              <thead>
                <tr><Th>Candidate</Th><Th>National ID</Th><Th>Employer</Th><Th>City</Th><Th>Eligibility</Th><Th>Payment</Th></tr>
              </thead>
              <tbody>
                {roster.map((c) => (
                  <tr key={c.id} className="hover:bg-navy-50/60">
                    <Td><a href={`/candidates/${c.id}`} className="font-medium text-teal-600 hover:underline">{c.fullName}</a></Td>
                    <Td className="font-mono text-[12px] text-navy-500">{mask(c.nationalId)}</Td>
                    <Td className="text-navy-600">{c.employer}</Td>
                    <Td>{c.city}</Td>
                    <Td><StatusBadge status={c.eligibilityStatus} /></Td>
                    <Td><StatusBadge status={c.paymentStatus} /></Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>

          {/* Incidents */}
          <Card>
            <CardHeader title="Related incidents" subtitle="Events reported during or linked to this session" />
            {incidents.length === 0 ? (
              <p className="p-5 text-sm text-navy-400">No incidents recorded for this session.</p>
            ) : (
              <Table>
                <thead><tr><Th>Incident</Th><Th>Type</Th><Th>Severity</Th><Th>Status</Th><Th>Recommended action</Th></tr></thead>
                <tbody>
                  {incidents.map((i) => (
                    <tr key={i.id} className="hover:bg-navy-50/60">
                      <Td className="font-mono text-[12px] text-navy-500">{i.id}</Td>
                      <Td>{titleCase(i.type)}</Td>
                      <Td><RiskBadge level={i.severity} /></Td>
                      <Td><StatusBadge status={i.resolutionStatus} /></Td>
                      <Td className="text-xs text-navy-500">{i.recommendedAction}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>
        </div>

        {/* Sidebar: seat map */}
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-navy-800">Seat map</h3>
            <p className="text-xs text-navy-400 mt-0.5 mb-3">{booked} of {session.seatCapacity} seats booked</p>
            <div className="grid grid-cols-6 gap-1.5">
              {Array.from({ length: session.seatCapacity }, (_, i) => {
                const filled = i < booked;
                return (
                  <div
                    key={i}
                    title={`Seat ${i + 1} — ${filled ? "booked" : "available"}`}
                    className={`aspect-square rounded-md grid place-items-center text-[9px] font-medium ${filled ? "bg-teal-500 text-white" : "bg-navy-100 text-navy-400"}`}
                  >
                    {i + 1}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-3 text-[11px] text-navy-500">
              <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-teal-500" />Booked</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-navy-100" />Available</span>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-navy-800 mb-3">At a glance</h3>
            <dl className="space-y-2.5 text-sm">
              <Field row label="Seats booked" value={`${booked} / ${session.seatCapacity}`} />
              <Field row label="Utilization" value={`${Math.round((booked / session.seatCapacity) * 100)}%`} />
              <Field row label="Incidents" value={String(incidents.length)} />
              <Field row label="Invigilators" value={String(session.invigilatorIds.length)} />
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, mono, row }: { label: string; value: string; mono?: boolean; row?: boolean }) {
  if (row) {
    return (
      <div className="flex justify-between gap-3">
        <dt className="text-navy-400">{label}</dt>
        <dd className="font-medium tabular-nums text-navy-700">{value}</dd>
      </div>
    );
  }
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-navy-400 mb-0.5">{label}</p>
      <p className={`text-navy-800 ${mono ? "font-mono text-[12px]" : "font-medium"}`}>{value}</p>
    </div>
  );
}
