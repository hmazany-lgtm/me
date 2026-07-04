"use client";
import Link from "next/link";
import { PageHeader, Card, CardHeader, Kpi, Badge, StatusBadge } from "@/components/ui";
import { Meter, BarChart } from "@/components/charts";
import { CENTERS } from "@/data/seed";
import { sar } from "@/lib/format";
import { Icon } from "@/components/Icon";

export default function CentersPage() {
  const operational = CENTERS.filter((c) => c.status === "operational");
  const totalCapacity = operational.reduce((s, c) => s + c.capacity, 0);
  const totalBooked = operational.reduce((s, c) => s + c.seatsBooked, 0);
  const avgOccupancy = totalCapacity ? Math.round((totalBooked / totalCapacity) * 100) : 0;
  const totalRevenue = CENTERS.reduce((s, c) => s + c.revenueYtd, 0);

  const occupancyData = operational.map((c) => ({
    label: c.city,
    value: c.capacity ? Math.round((c.seatsBooked / c.capacity) * 100) : 0,
  }));

  return (
    <div>
      <PageHeader
        title="Exam Centers"
        subtitle="Capacity, utilization, revenue and readiness across the delivery network."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Kpi label="Operational Centers" value={operational.length} hint={`${CENTERS.length} total incl. planned`} tone="navy" />
        <Kpi label="Total Capacity" value={totalCapacity} hint="seats" tone="teal" />
        <Kpi label="Avg Occupancy" value={`${avgOccupancy}%`} tone={avgOccupancy >= 65 ? "green" : "gold"} />
        <Kpi label="Revenue YTD" value={sar(totalRevenue)} tone="gold" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {CENTERS.map((c) => {
          const occupancy = c.capacity ? Math.round((c.seatsBooked / c.capacity) * 100) : 0;
          const isFuture = c.status === "future";
          return (
            <Card key={c.id} className={`p-5 ${isFuture ? "border-dashed opacity-80" : ""}`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <Link href={`/centers/${c.id}`} className="text-sm font-semibold text-navy-800 hover:text-teal-600 hover:underline flex items-center gap-1.5">
                    <Icon name="building" className="w-4 h-4 text-navy-400" />{c.name}
                  </Link>
                  <p className="text-xs text-navy-400 mt-0.5">{c.city}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>

              {isFuture ? (
                <p className="text-xs text-navy-400 py-4">Planned center — not yet operational. Capacity and utilization figures will populate on go-live.</p>
              ) : (
                <>
                  <div className="mb-3">
                    <Meter value={occupancy} tone={occupancy >= 80 ? "amber" : "teal"} label="Occupancy" />
                    <p className="text-[11px] text-navy-400 mt-1">{c.seatsBooked} of {c.capacity} seats booked</p>
                  </div>
                  <dl className="grid grid-cols-2 gap-y-2 gap-x-3 text-xs">
                    <Stat label="Devices" value={`${c.devices}`} />
                    <Stat label="Device ready" value={`${c.deviceReady}%`} />
                    <Stat label="Invigilators" value={`${c.invigilatorPool}`} />
                    <Stat label="Satisfaction" value={`${c.satisfaction.toFixed(1)} / 5`} />
                    <Stat label="Incidents" value={`${c.incidents}`} />
                    <Stat label="Revenue YTD" value={sar(c.revenueYtd)} />
                  </dl>
                  {c.incidents > 0 && <div className="mt-3"><Badge tone={c.incidents >= 4 ? "red" : "amber"}>{c.incidents} incidents YTD</Badge></div>}
                </>
              )}
            </Card>
          );
        })}
      </div>

      <Card className="mt-4">
        <CardHeader title="Occupancy by center" subtitle="Booked seats as a share of capacity (operational centers)" />
        <div className="p-5">
          <BarChart data={occupancyData} unit="%" />
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-navy-400">{label}</span>
      <span className="font-medium text-navy-700 tabular-nums">{value}</span>
    </div>
  );
}
