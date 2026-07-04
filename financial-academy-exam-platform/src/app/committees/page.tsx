"use client";
import Link from "next/link";
import { PageHeader, Card, CardHeader, Kpi, Badge, StatusBadge, Table, Th, Td, InfoBanner, Button } from "@/components/ui";
import { COMMITTEES, COMMITTEE_DECISIONS } from "@/data/seed";
import { userName, shortDate } from "@/lib/format";
import { Icon } from "@/components/Icon";

const TODAY = "2026-07-04";

const COMMITTEE_FUNCTIONS = [
  "Review certification blueprint",
  "Approve exam forms",
  "Approve question batches",
  "Review item analysis",
  "Decide on compromised questions",
  "Approve result release",
  "Review incidents",
  "Review appeals",
];

export default function CommitteesPage() {
  const decisions = COMMITTEE_DECISIONS;
  const deferred = decisions.filter((d) => d.status === "deferred").length;
  const actionsDue = decisions.filter((d) => d.dueDate >= TODAY).length;

  const committeeName = (id: string) => COMMITTEES.find((c) => c.id === id)?.name ?? id;

  return (
    <div>
      <PageHeader
        title="Governance Committees"
        subtitle="Standing committees that govern exam content, security, and result release under a maker-checker model."
        actions={
          <Button variant="secondary"><Icon name="calendar" className="w-4 h-4" />Schedule meeting</Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Kpi label="Committees" value={COMMITTEES.length} tone="navy" />
        <Kpi label="Decisions This Period" value={decisions.length} tone="teal" />
        <Kpi label="Deferred" value={deferred} tone="gold" />
        <Kpi label="Actions Due" value={actionsDue} tone="red" />
      </div>

      <InfoBanner tone="teal">
        <span className="font-medium">Governance & audit.</span> Committee decisions are recorded with attendance, supporting documents, and action owners. Every decision is auditable and enforces segregation of duties between authoring, approval, and release.
      </InfoBanner>

      <div className="grid md:grid-cols-2 gap-5 mt-5">
        {COMMITTEES.map((c) => (
          <Card key={c.id}>
            <CardHeader
              title={<span className="flex items-center gap-2"><Icon name="committee" className="w-4 h-4 text-teal-600" />{c.name}</span>}
              subtitle={c.mandate}
            />
            <div className="px-5 py-4">
              <p className="text-[11px] uppercase tracking-wide text-navy-400 mb-2">Members</p>
              <div className="flex flex-wrap gap-1.5">
                {c.members.map((m) => <Badge key={m} tone="blue">{userName(m)}</Badge>)}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-5">
        <CardHeader title="Committee functions" subtitle="Scope of matters brought before the committees" />
        <ul className="px-5 py-4 grid sm:grid-cols-2 gap-2">
          {COMMITTEE_FUNCTIONS.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-navy-700">
              <Icon name="check" className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />{f}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="mt-5">
        <CardHeader title="Committee decisions" subtitle="Minuted resolutions and their action owners" />
        <Table>
          <thead>
            <tr>
              <Th>Committee</Th><Th>Meeting</Th><Th>Agenda</Th><Th>Decision</Th><Th>Status</Th><Th>Action owners</Th><Th>Due</Th>
            </tr>
          </thead>
          <tbody>
            {decisions.map((d) => (
              <tr key={d.id} className="hover:bg-navy-50/60">
                <Td className="font-medium text-navy-800">{committeeName(d.committeeId)}</Td>
                <Td className="text-navy-600 whitespace-nowrap">{shortDate(d.meetingDate)}</Td>
                <Td className="text-navy-600 max-w-xs">
                  <Link href={`/committees/${d.id}`} className="text-teal-600 hover:underline">{d.agenda}</Link>
                </Td>
                <Td className="text-navy-600 max-w-xs">{d.decision}</Td>
                <Td><StatusBadge status={d.status} /></Td>
                <Td>
                  <span className="flex flex-wrap gap-1">{d.actionOwners.map((o) => <Badge key={o} tone="gray">{userName(o)}</Badge>)}</span>
                </Td>
                <Td className="text-navy-600 whitespace-nowrap">{shortDate(d.dueDate)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
