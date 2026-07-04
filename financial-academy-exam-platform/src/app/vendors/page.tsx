"use client";
import { PageHeader, Card, CardHeader, Kpi, Badge, StatusBadge, Table, Th, Td, InfoBanner, Button } from "@/components/ui";
import { BarChart, Meter } from "@/components/charts";
import { VENDORS } from "@/data/seed";
import { centerName, titleCase } from "@/lib/format";
import { Icon } from "@/components/Icon";

export default function VendorsPage() {
  const active = VENDORS.filter((v) => v.status === "active").length;
  const breaches = VENDORS.filter((v) => v.slaActual < v.slaTarget).length;
  const underReview = VENDORS.filter((v) => v.status === "review").length;

  return (
    <div>
      <PageHeader
        title="Vendor Management"
        subtitle="Platform, proctoring, and center partners with contracted service levels and assigned scope."
        actions={<Button variant="secondary"><Icon name="vendor" className="w-4 h-4" />Add vendor</Button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Kpi label="Total Vendors" value={VENDORS.length} tone="navy" />
        <Kpi label="Active" value={active} tone="green" />
        <Kpi label="SLA Breaches" value={breaches} tone="red" />
        <Kpi label="Under Review" value={underReview} tone="gold" />
      </div>

      <InfoBanner tone="amber">
        <span className="font-medium">Limited access.</span> Vendors operate under a limited-access role and can see only the operational data for the centers and sessions assigned to them. Candidate PII and secure exam content are never exposed to vendors.
      </InfoBanner>

      <Card className="mt-5">
        <CardHeader title="Vendor SLA performance" subtitle="Actual service level achieved per vendor (%)" />
        <div className="p-5">
          <BarChart data={VENDORS.map((v) => ({ label: v.name, value: v.slaActual }))} unit="%" />
        </div>
      </Card>

      <Card className="mt-5">
        <CardHeader title="Vendors" subtitle="Contracts, service levels, and assigned centers" />
        <Table>
          <thead>
            <tr>
              <Th>Vendor</Th><Th>Type</Th><Th className="text-right">SLA target</Th><Th>SLA actual</Th><Th>Status</Th><Th>Assigned centers</Th><Th></Th>
            </tr>
          </thead>
          <tbody>
            {VENDORS.map((v) => {
              const breach = v.slaActual < v.slaTarget;
              return (
                <tr key={v.id} className="hover:bg-navy-50/60">
                  <Td className="font-medium text-navy-800">{v.name}</Td>
                  <Td><Badge tone="blue">{titleCase(v.type)}</Badge></Td>
                  <Td className="text-right tabular-nums text-navy-600">{v.slaTarget}%</Td>
                  <Td className="w-44">
                    <div className={`text-[11px] mb-1 tabular-nums ${breach ? "text-rose-600 font-medium" : "text-navy-500"}`}>{v.slaActual}%</div>
                    <Meter value={v.slaActual} tone={breach ? "red" : "teal"} />
                  </Td>
                  <Td><StatusBadge status={v.status} /></Td>
                  <Td>
                    <span className="flex flex-wrap gap-1">
                      {v.assignedCenters.length === 0
                        ? <span className="text-xs text-navy-400">All / none</span>
                        : v.assignedCenters.map((c) => <Badge key={c} tone="gray">{centerName(c)}</Badge>)}
                    </span>
                  </Td>
                  <Td>
                    <Button variant="ghost"><Icon name="report" className="w-4 h-4" />SLA report</Button>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
