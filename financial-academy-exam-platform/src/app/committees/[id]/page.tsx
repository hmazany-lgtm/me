"use client";
import { useState } from "react";
import { notFound } from "next/navigation";
import { PageHeader, Card, CardHeader, Badge, StatusBadge, InfoBanner, Button } from "@/components/ui";
import { COMMITTEES, COMMITTEE_DECISIONS } from "@/data/seed";
import { userName, shortDate } from "@/lib/format";
import { Icon } from "@/components/Icon";

export default function CommitteeDecisionDetailPage({ params }: { params: { id: string } }) {
  const decision = COMMITTEE_DECISIONS.find((d) => d.id === params.id);
  const [recorded, setRecorded] = useState<"approved" | "rejected" | "deferred" | null>(null);
  if (!decision) notFound();

  const committee = COMMITTEES.find((c) => c.id === decision.committeeId);

  const def = (label: string, value: React.ReactNode) => (
    <div className="py-2.5 border-b border-navy-50 last:border-0">
      <dt className="text-[11px] uppercase tracking-wide text-navy-400">{label}</dt>
      <dd className="text-sm text-navy-800 mt-0.5">{value}</dd>
    </div>
  );

  return (
    <div>
      <PageHeader
        title={committee?.name ?? "Committee Decision"}
        subtitle={decision.agenda}
        actions={
          <>
            <StatusBadge status={decision.status} />
            <Button variant="secondary" href="/committees"><Icon name="logout" className="w-4 h-4" />Back</Button>
          </>
        }
      />

      <InfoBanner tone="teal">
        <span className="font-medium">Governance & audit.</span> This decision record is append-only. Attendance, supporting documents, and action owners form the auditable trail for governance and regulatory review.
      </InfoBanner>

      <div className="grid lg:grid-cols-2 gap-5 mt-5">
        <Card>
          <CardHeader title="Decision record" subtitle="Minuted resolution" />
          <dl className="px-5 py-2">
            {def("Meeting date", shortDate(decision.meetingDate))}
            {def("Committee", committee?.name ?? decision.committeeId)}
            {def("Agenda", decision.agenda)}
            {def("Decision", decision.decision)}
            {def("Status", <StatusBadge status={decision.status} />)}
            {def("Due date", shortDate(decision.dueDate))}
          </dl>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Members present" subtitle="Committee attendance" />
            <div className="px-5 py-4 flex flex-wrap gap-1.5">
              {(committee?.members ?? []).map((m) => <Badge key={m} tone="blue">{userName(m)}</Badge>)}
            </div>
          </Card>

          <Card>
            <CardHeader title="Supporting documents" subtitle="Evidence tabled at the meeting" />
            <div className="px-5 py-4">
              {decision.documents.length === 0 ? (
                <p className="text-sm text-navy-400">No documents attached.</p>
              ) : (
                <ul className="space-y-2">
                  {decision.documents.map((doc) => (
                    <li key={doc} className="flex items-center gap-2 text-sm text-navy-700">
                      <Icon name="report" className="w-4 h-4 text-navy-400 shrink-0" />
                      <span className="font-mono text-[13px]">{doc}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
        </div>
      </div>

      <Card className="mt-5">
        <CardHeader title="Action owners" subtitle="Follow-up items and accountable owners" />
        <div className="px-5 py-4 space-y-2">
          {decision.actionOwners.map((o) => (
            <div key={o} className="flex items-center justify-between gap-3 rounded-lg bg-navy-50 px-3 py-2">
              <span className="flex items-center gap-2 text-sm text-navy-800">
                <Icon name="users" className="w-4 h-4 text-teal-600" />{userName(o)}
              </span>
              <span className="text-xs text-navy-500">Due {shortDate(decision.dueDate)}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-5">
        <CardHeader title="Approval workflow" subtitle="Maker-checker path for this resolution" />
        <ol className="px-6 py-5 space-y-0">
          {["Tabled", "Reviewed", "Decision recorded", "Actions assigned", "Closed"].map((step, i, arr) => {
            const activeIdx = decision.status === "deferred" ? 2 : 3;
            const done = i < activeIdx;
            const current = i === activeIdx;
            return (
              <li key={step} className="flex gap-3 pb-6 last:pb-0 relative">
                {i < arr.length - 1 && <span className="absolute left-[11px] top-6 bottom-0 w-px bg-navy-100" />}
                <span className={`z-10 grid place-items-center w-6 h-6 rounded-full text-white shrink-0 ${done ? "bg-emerald-600" : current ? "bg-teal-600" : "bg-navy-200"}`}>
                  {done ? <Icon name="check" className="w-3.5 h-3.5" /> : <span className="text-[11px] font-semibold">{i + 1}</span>}
                </span>
                <div>
                  <p className="text-sm font-medium text-navy-800">{step}</p>
                  <p className="text-xs text-navy-400">{done ? "Completed" : current ? "Current gate" : "Pending"}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </Card>

      <Card className="mt-5">
        <CardHeader title="Record decision" subtitle="Committee resolution controls (visual)" />
        <div className="px-5 py-4">
          <div className="flex flex-wrap gap-2">
            <Button variant={recorded === "approved" ? "primary" : "secondary"} onClick={() => setRecorded("approved")}>
              <Icon name="check" className="w-4 h-4" />Approve
            </Button>
            <Button variant={recorded === "rejected" ? "danger" : "secondary"} onClick={() => setRecorded("rejected")}>
              <Icon name="x" className="w-4 h-4" />Reject
            </Button>
            <Button variant={recorded === "deferred" ? "primary" : "secondary"} onClick={() => setRecorded("deferred")}>
              <Icon name="clock" className="w-4 h-4" />Defer
            </Button>
          </div>
          {recorded && (
            <div className="mt-4">
              <InfoBanner tone={recorded === "rejected" ? "rose" : recorded === "deferred" ? "amber" : "teal"}>
                Decision marked <span className="font-medium">{recorded}</span> in this session. A real submission would require quorum confirmation and would append an immutable audit entry.
              </InfoBanner>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
