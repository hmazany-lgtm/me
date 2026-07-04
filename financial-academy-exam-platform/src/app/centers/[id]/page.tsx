"use client";
import { notFound } from "next/navigation";
import { PageHeader, Card, CardHeader, Kpi, Badge, StatusBadge, Table, Th, Td, InfoBanner } from "@/components/ui";
import { Meter, LineChart, BarChart } from "@/components/charts";
import { RiskBadge } from "@/components/ui";
import { CENTERS, SESSIONS, INCIDENTS } from "@/data/seed";
import { sar, certCode, certName, titleCase, shortDate } from "@/lib/format";
import { Icon } from "@/components/Icon";

export default function CenterDetail({ params }: { params: { id: string } }) {
  const center = CENTERS.find((c) => c.id === params.id);
  if (!center) return notFound();

  const sessions = SESSIONS.filter((s) => s.centerId === center.id);
  const sessionIds = new Set(sessions.map((s) => s.id));
  const incidents = INCIDENTS.filter((i) => sessionIds.has(i.sessionId));
  const candidateCount = sessions.reduce((sum, s) => sum + s.candidateIds.length, 0);
  const occupancy = center.capacity ? Math.round((center.seatsBooked / center.capacity) * 100) : 0;
  const seatsAvailable = center.capacity - center.seatsBooked;

  // Sessions per day (derived from this center's sessions).
  const perDayMap = new Map<string, number>();
  for (const s of sessions) perDayMap.set(s.date, (perDayMap.get(s.date) ?? 0) + 1);
  const perDay = Array.from(perDayMap.entries()).sort((a, b) => (a[0] < b[0] ? -1 : 1));

  // Plausible daily utilization series (last 7 days) anchored to current occupancy.
  const utilSeries = Array.from({ length: 7 }, (_, i) => {
    const wobble = [-9, 5, -3, 8, -5, 4, 0][i];
    return { label: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i], value: Math.max(0, Math.min(100, occupancy + wobble)) };
  });

  // Plausible monthly revenue run-rate derived from YTD.
  const monthly = center.revenueYtd / 6;
  const revSeries = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((m, i) => ({
    label: m,
    value: Math.round((monthly * (0.82 + i * 0.06)) / 1000),
  }));

  const isFuture = center.status === "future";

  return (
    <div>
      <PageHeader
        title={center.name}
        subtitle={`${center.city} · ${center.rooms} rooms · ${center.devices} workstations`}
        actions={<StatusBadge status={center.status} />}
      />

      {isFuture && (
        <div className="mb-4">
          <InfoBanner tone="amber">
            <span className="font-medium">Planned center.</span> This location is not yet operational. Utilization, revenue and incident figures will begin populating once the center goes live.
          </InfoBanner>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Kpi label="Occupancy" value={`${occupancy}%`} hint={`${center.seatsBooked} of ${center.capacity} seats`} tone={occupancy >= 80 ? "gold" : "teal"} />
        <Kpi label="Candidates Hosted" value={candidateCount} hint={`${sessions.length} sessions`} tone="navy" />
        <Kpi label="Revenue YTD" value={sar(center.revenueYtd)} tone="gold" />
        <Kpi label="Incidents" value={incidents.length} tone={incidents.length >= 3 ? "red" : "green"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Utilization analytics */}
          <Card>
            <CardHeader title="Utilization" subtitle="Seat availability and device readiness" />
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1">
                <p className="text-2xl font-semibold text-navy-800 tabular-nums">{center.seatsBooked}</p>
                <p className="text-xs text-navy-400">Seats booked</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-semibold text-navy-800 tabular-nums">{seatsAvailable}</p>
                <p className="text-xs text-navy-400">Seats available</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-semibold text-navy-800 tabular-nums">{center.satisfaction.toFixed(1)}</p>
                <p className="text-xs text-navy-400">Satisfaction / 5</p>
              </div>
              <div className="md:col-span-3 space-y-3 pt-2">
                <Meter value={occupancy} tone={occupancy >= 80 ? "amber" : "teal"} label="Seat occupancy" />
                <Meter value={center.deviceReady} tone={center.deviceReady >= 95 ? "green" : "amber"} label="Device readiness" />
              </div>
            </div>
          </Card>

          {/* Daily utilization chart */}
          <Card>
            <CardHeader title="Daily utilization" subtitle="Seat occupancy trend (last 7 days)" />
            <div className="p-5">
              <LineChart data={utilSeries} unit="%" />
            </div>
          </Card>

          {/* Revenue chart */}
          <Card>
            <CardHeader title="Revenue run-rate" subtitle="Monthly revenue (SAR thousands)" />
            <div className="p-5">
              <BarChart data={revSeries} unit="k" color="#c9a24b" />
            </div>
          </Card>

          {/* Sessions hosted */}
          <Card>
            <CardHeader title="Sessions hosted" subtitle={`${sessions.length} sessions scheduled at this center`} />
            {sessions.length === 0 ? (
              <p className="p-5 text-sm text-navy-400">No sessions scheduled at this center.</p>
            ) : (
              <Table>
                <thead><tr><Th>Session</Th><Th>Certification</Th><Th>Date / Time</Th><Th>Room</Th><Th className="text-right">Candidates</Th><Th>Status</Th></tr></thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.id} className="hover:bg-navy-50/60">
                      <Td><a href={`/sessions/${s.id}`} className="font-medium text-teal-600 hover:underline">{s.id}</a></Td>
                      <Td><span title={certName(s.certificationId)}>{certCode(s.certificationId)}</span></Td>
                      <Td className="whitespace-nowrap">{shortDate(s.date)} · {s.startTime}</Td>
                      <Td>{s.room}</Td>
                      <Td className="text-right tabular-nums">{s.candidateIds.length}</Td>
                      <Td><StatusBadge status={s.status} /></Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>

          {/* Incidents */}
          <Card>
            <CardHeader title="Incidents" subtitle="Reported across this center's sessions" />
            {incidents.length === 0 ? (
              <p className="p-5 text-sm text-navy-400">No incidents recorded at this center.</p>
            ) : (
              <Table>
                <thead><tr><Th>Incident</Th><Th>Session</Th><Th>Type</Th><Th>Severity</Th><Th>Status</Th></tr></thead>
                <tbody>
                  {incidents.map((i) => (
                    <tr key={i.id} className="hover:bg-navy-50/60">
                      <Td className="font-mono text-[12px] text-navy-500">{i.id}</Td>
                      <Td className="font-mono text-[12px] text-navy-500">{i.sessionId}</Td>
                      <Td>{titleCase(i.type)}</Td>
                      <Td><RiskBadge level={i.severity} /></Td>
                      <Td><StatusBadge status={i.resolutionStatus} /></Td>
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
            <h3 className="text-sm font-semibold text-navy-800 mb-3">Rooms</h3>
            {center.rooms === 0 ? (
              <p className="text-xs text-navy-400">No rooms configured.</p>
            ) : (
              <ul className="space-y-2">
                {Array.from({ length: center.rooms }, (_, i) => {
                  const ready = center.deviceReady >= ((i + 1) / center.rooms) * 100 - 5;
                  return (
                    <li key={i} className="flex items-center justify-between rounded-lg border border-navy-100 px-3 py-2 text-sm">
                      <span className="inline-flex items-center gap-1.5 text-navy-700"><Icon name="building" className="w-3.5 h-3.5 text-navy-400" />Room {i + 1}</span>
                      <Badge tone={ready ? "green" : "amber"}>{ready ? "Device ready" : "Check devices"}</Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-navy-800 mb-3">Center metrics</h3>
            <dl className="space-y-2.5 text-sm">
              <Row label="Capacity" value={`${center.capacity} seats`} />
              <Row label="Workstations" value={`${center.devices}`} />
              <Row label="Device readiness" value={`${center.deviceReady}%`} />
              <Row label="Invigilator pool" value={`${center.invigilatorPool}`} />
              <Row label="Satisfaction" value={`${center.satisfaction.toFixed(1)} / 5`} />
              <Row label="Revenue YTD" value={sar(center.revenueYtd)} />
            </dl>
          </Card>

          {perDay.length > 0 && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-navy-800 mb-3">Sessions per day</h3>
              <ul className="space-y-2 text-sm">
                {perDay.map(([date, n]) => (
                  <li key={date} className="flex items-center justify-between">
                    <span className="text-navy-500">{shortDate(date)}</span>
                    <span className="font-medium text-navy-700 tabular-nums">{n} session{n > 1 ? "s" : ""}</span>
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-navy-400">{label}</dt>
      <dd className="font-medium tabular-nums text-navy-700">{value}</dd>
    </div>
  );
}
