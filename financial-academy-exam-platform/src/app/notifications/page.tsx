"use client";
import { useState } from "react";
import { PageHeader, Card, CardHeader, Kpi, Badge, StatusBadge, Table, Th, Td, InfoBanner } from "@/components/ui";
import { NOTIFICATIONS } from "@/data/seed";
import { titleCase, dateTime } from "@/lib/format";

/** Supported notification templates and the channels each one can use. */
const TEMPLATES: { key: string; label: string; channels: string[] }[] = [
  { key: "registration_confirmation", label: "Registration confirmation", channels: ["email", "in_app"] },
  { key: "exam_booking", label: "Exam booking confirmation", channels: ["email", "sms"] },
  { key: "exam_reminder", label: "Exam reminder", channels: ["email", "sms", "whatsapp"] },
  { key: "reschedule", label: "Rescheduling confirmation", channels: ["email", "sms"] },
  { key: "cancellation", label: "Cancellation confirmation", channels: ["email"] },
  { key: "result_available", label: "Result available", channels: ["email", "sms", "in_app"] },
  { key: "certificate_issued", label: "Certificate issued", channels: ["email", "whatsapp"] },
  { key: "retake_eligibility", label: "Retake eligibility", channels: ["email"] },
  { key: "appeal_received", label: "Appeal received", channels: ["email", "in_app"] },
  { key: "appeal_decision", label: "Appeal decision", channels: ["email", "in_app"] },
  { key: "incident_follow_up", label: "Incident follow-up", channels: ["in_app", "email"] },
  { key: "invigilator_assignment", label: "Invigilator assignment", channels: ["in_app", "email"] },
  { key: "committee_approval", label: "Committee approval request", channels: ["in_app", "email"] },
];

const CHANNEL_TONE: Record<string, "blue" | "teal" | "green" | "amber" | "gold"> = {
  email: "blue", sms: "amber", whatsapp: "green", in_app: "teal",
};

const CHANNELS = ["all", "email", "sms", "whatsapp", "in_app"];

export default function NotificationsPage() {
  const [channel, setChannel] = useState("all");
  const rows = NOTIFICATIONS.filter((n) => channel === "all" || n.channel === channel);

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Candidate and staff notification workflows across email, SMS, WhatsApp and in-app channels."
        actions={
          <select value={channel} onChange={(e) => setChannel(e.target.value)} className="rounded-lg border border-navy-200 bg-white text-sm py-1.5 px-2.5">
            {CHANNELS.map((c) => <option key={c} value={c}>{c === "all" ? "All channels" : titleCase(c)}</option>)}
          </select>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Kpi label="Total Notifications" value={NOTIFICATIONS.length} tone="navy" />
        <Kpi label="Sent" value={NOTIFICATIONS.filter((n) => n.status === "sent").length} tone="green" />
        <Kpi label="Queued" value={NOTIFICATIONS.filter((n) => n.status === "queued").length} tone="gold" />
        <Kpi label="Read" value={NOTIFICATIONS.filter((n) => n.status === "read").length} tone="teal" />
      </div>

      <div className="mb-5">
        <InfoBanner tone="amber">SMS and WhatsApp delivery are integration <span className="font-medium">placeholders</span> in this prototype — messages are queued and shown, but not dispatched to an external gateway.</InfoBanner>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Notification Log" subtitle={`${rows.length} message(s)`} />
          <Table>
            <thead><tr><Th>Channel</Th><Th>Template</Th><Th>Subject</Th><Th>Status</Th><Th>Time</Th></tr></thead>
            <tbody>
              {rows.map((n) => (
                <tr key={n.id} className="hover:bg-navy-50/60">
                  <Td><Badge tone={CHANNEL_TONE[n.channel]}>{titleCase(n.channel)}</Badge></Td>
                  <Td className="text-navy-600">{titleCase(n.template)}</Td>
                  <Td className="font-medium text-navy-800">{n.subject}</Td>
                  <Td><StatusBadge status={n.status} /></Td>
                  <Td className="text-navy-500 text-xs">{dateTime(n.createdAt)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        <Card>
          <CardHeader title="Supported Templates" subtitle="Automated triggers & channels" />
          <ul className="divide-y divide-navy-50">
            {TEMPLATES.map((t) => (
              <li key={t.key} className="px-5 py-3">
                <p className="text-sm font-medium text-navy-700">{t.label}</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {t.channels.map((c) => <Badge key={c} tone={CHANNEL_TONE[c]}>{titleCase(c)}</Badge>)}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
