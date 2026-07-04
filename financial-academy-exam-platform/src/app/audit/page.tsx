"use client";
import { useMemo, useState } from "react";
import { PageHeader, Card, Kpi, Badge, Table, Th, Td, InfoBanner, Restricted } from "@/components/ui";
import { AUDIT_LOGS } from "@/data/seed";
import { userName, dateTime, titleCase } from "@/lib/format";
import { useSession } from "@/lib/session";
import { can, ROLES } from "@/lib/permissions";
import { RiskBadge } from "@/components/ui";
import { Icon } from "@/components/Icon";

const ACTIONS = Array.from(new Set(AUDIT_LOGS.map((l) => l.action)));

export default function AuditPage() {
  const { user } = useSession();
  const [action, setAction] = useState("all");
  const [risk, setRisk] = useState("all");
  const [q, setQ] = useState("");

  const rows = useMemo(() => AUDIT_LOGS.filter((l) => {
    if (action !== "all" && l.action !== action) return false;
    if (risk !== "all" && l.riskLevel !== risk) return false;
    if (q) {
      const hay = `${userName(l.userId)} ${l.action} ${l.objectType} ${l.objectId} ${l.ipAddress}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  }), [action, risk, q]);

  if (!can(user.roleKey, "view_audit")) {
    return (
      <div>
        <PageHeader title="Audit Trail" subtitle="Append-only record of every sensitive action on the platform." />
        <Restricted message="Viewing the audit trail requires the View Audit Logs permission, held by auditors, administrators, and governance roles." />
      </div>
    );
  }

  const highRisk = AUDIT_LOGS.filter((l) => l.riskLevel === "high").length;
  const failedLogins = AUDIT_LOGS.filter((l) => l.action === "failed_login").length;
  const answerViews = AUDIT_LOGS.filter((l) => l.action === "answer_viewed").length;

  return (
    <div>
      <PageHeader
        title="Audit Trail"
        subtitle="Full attribution for every access and change: who, what, when, where, and from which device."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Kpi label="Total Events" value={AUDIT_LOGS.length} tone="navy" />
        <Kpi label="High-risk Events" value={highRisk} tone="red" />
        <Kpi label="Failed Logins" value={failedLogins} tone="gold" />
        <Kpi label="Answer-key Views" value={answerViews} tone="teal" />
      </div>

      <InfoBanner tone="amber">
        <span className="font-medium">Append-only log.</span> Audit entries cannot be edited or deleted. Sensitive actions — answer-key reveals, exports, result changes, and permission changes — carry a watermark and full attribution to the acting identity.
      </InfoBanner>

      <Card className="mt-5">
        <div className="flex flex-wrap items-center gap-2 p-4 border-b border-navy-100">
          <div className="relative flex-1 min-w-[200px]">
            <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-navy-300" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search user, object, or IP…" className="w-full rounded-lg bg-navy-50 border border-navy-100 pl-9 pr-3 py-2 text-sm" />
          </div>
          <select value={action} onChange={(e) => setAction(e.target.value)} className="rounded-lg border border-navy-200 bg-white text-sm py-2 px-2.5">
            <option value="all">All actions</option>
            {ACTIONS.map((a) => <option key={a} value={a}>{titleCase(a)}</option>)}
          </select>
          <select value={risk} onChange={(e) => setRisk(e.target.value)} className="rounded-lg border border-navy-200 bg-white text-sm py-2 px-2.5">
            <option value="all">All risk levels</option>
            {["low", "medium", "high"].map((r) => <option key={r} value={r}>{titleCase(r)}</option>)}
          </select>
        </div>
        <Table>
          <thead>
            <tr>
              <Th>Time</Th><Th>User</Th><Th>Role</Th><Th>Action</Th><Th>Object</Th><Th>Change</Th><Th>IP</Th><Th>Device</Th><Th>Risk</Th><Th>Notes</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id} className={l.riskLevel === "high" ? "bg-rose-50/60 hover:bg-rose-50" : "hover:bg-navy-50/60"}>
                <Td className="text-navy-600 whitespace-nowrap">{dateTime(l.createdAt)}</Td>
                <Td className="font-medium text-navy-800 whitespace-nowrap">{userName(l.userId)}</Td>
                <Td className="text-navy-600 whitespace-nowrap">{ROLES[l.roleKey].name}</Td>
                <Td>{titleCase(l.action)}</Td>
                <Td className="whitespace-nowrap">
                  <span className="text-navy-600">{l.objectType}</span>
                  {l.objectId !== "—" && <span className="font-mono text-[12px] text-navy-400 ml-1">{l.objectId}</span>}
                </Td>
                <Td>
                  {l.beforeValue || l.afterValue ? (
                    <span className="text-[12px]">
                      <span className="text-rose-600 line-through">{l.beforeValue}</span>
                      <span className="mx-1 text-navy-300">→</span>
                      <span className="text-emerald-700">{l.afterValue}</span>
                    </span>
                  ) : <span className="text-navy-300">—</span>}
                </Td>
                <Td className="font-mono text-[12px] text-navy-500 whitespace-nowrap">{l.ipAddress}</Td>
                <Td className="text-navy-600 whitespace-nowrap">{l.device}</Td>
                <Td><RiskBadge level={l.riskLevel} /></Td>
                <Td className="text-navy-500 text-xs max-w-[180px]">{l.notes || "—"}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
        <div className="px-4 py-3 text-xs text-navy-400">Showing {rows.length} of {AUDIT_LOGS.length} events.</div>
      </Card>
    </div>
  );
}
