"use client";
import { useState } from "react";
import { PageHeader, Card, CardHeader, Badge, InfoBanner, Button } from "@/components/ui";
import { Icon } from "@/components/Icon";

const TABS = ["General", "Security", "Quality Assurance", "Localization", "Integrations"] as const;
type Tab = (typeof TABS)[number];

function Toggle({ label, hint, defaultOn = false, disabled = false }: { label: string; hint?: string; defaultOn?: boolean; disabled?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-navy-50 last:border-0">
      <div>
        <p className="text-sm font-medium text-navy-800">{label}</p>
        {hint && <p className="text-xs text-navy-400 mt-0.5">{hint}</p>}
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOn((v) => !v)}
        className={`relative shrink-0 w-11 h-6 rounded-full transition disabled:opacity-40 ${on ? "bg-teal-600" : "bg-navy-200"}`}
        aria-pressed={on}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}

function Field({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-wide text-navy-400">{label}</label>
      <input readOnly value={value} className="mt-1 w-full rounded-lg bg-navy-50 border border-navy-100 px-3 py-2 text-sm text-navy-700" />
      {note && <p className="text-xs text-navy-400 mt-1">{note}</p>}
    </div>
  );
}

const QA_WORKFLOWS = [
  { name: "Monthly question review", due: "2026-07-25", owner: "Item Development", status: "scheduled" },
  { name: "Quarterly blueprint review", due: "2026-09-15", owner: "Psychometrics", status: "scheduled" },
  { name: "Annual certification review", due: "2027-01-10", owner: "Certification", status: "scheduled" },
  { name: "Post-exam item analysis", due: "2026-07-08", owner: "Psychometrics", status: "in_review" },
  { name: "Candidate feedback review", due: "2026-07-20", owner: "Exam Operations", status: "scheduled" },
  { name: "Incident review", due: "2026-07-06", owner: "Security & Integrity", status: "in_review" },
  { name: "Vendor SLA review", due: "2026-07-31", owner: "Exam Operations", status: "scheduled" },
  { name: "Internal audit review", due: "2026-08-15", owner: "Internal Audit", status: "scheduled" },
];

const INTEGRATIONS = [
  { name: "Email", icon: "bell", status: "Connected", tone: "green" as const, desc: "Transactional and notification email delivery." },
  { name: "SMS", icon: "bell", status: "Placeholder", tone: "gray" as const, desc: "Text reminders and one-time passcodes." },
  { name: "WhatsApp", icon: "bell", status: "Placeholder", tone: "gray" as const, desc: "Candidate messaging channel." },
  { name: "Remote proctoring", icon: "eye", status: "Placeholder", tone: "gray" as const, desc: "Live and recorded remote invigilation." },
  { name: "LMS", icon: "blueprint", status: "Connected", tone: "green" as const, desc: "Learning management and program linkage." },
  { name: "Payment", icon: "certificate", status: "Connected", tone: "green" as const, desc: "Exam and retake fee collection." },
];

function StatusPill({ label }: { label: string }) {
  const tone = label === "Connected" ? "green" : label === "In progress" ? "amber" : "gray";
  return <Badge tone={tone}>{label}</Badge>;
}

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("General");
  const [rtl, setRtl] = useState(false);

  return (
    <div>
      <PageHeader
        title="Settings & Quality Assurance"
        subtitle="Academy configuration, security posture, QA cadence, localization, and integrations."
      />

      <div className="flex flex-wrap gap-1.5 mb-5 border-b border-navy-100">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm font-medium rounded-t-md -mb-px border-b-2 transition ${
              tab === t ? "border-teal-600 text-teal-700" : "border-transparent text-navy-400 hover:text-navy-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "General" && (
        <div className="grid lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader title="Academy identity" subtitle="Core organisation details" />
            <div className="px-5 py-4 space-y-4">
              <Field label="Legal name" value="The Financial Academy" />
              <Field label="Short name" value="TFA" />
              <Field label="Regulator relationships" value="SAMA · CMA · Insurance Authority" />
              <Field label="Primary contact" value="registrar@tfa.gov.sa" />
              <Field label="Time zone" value="Arabia Standard Time (UTC+3)" />
            </div>
          </Card>
          <Card>
            <CardHeader title="Branding" subtitle="Identity applied across the platform and certificates" />
            <div className="px-5 py-4 space-y-4">
              <Field label="Primary palette" value="Navy · Teal · Gold" note="Palette is fixed to the TFA visual identity." />
              <Field label="Certificate template" value="TFA Official — v3" />
              <InfoBanner tone="blue">Branding assets (logo, seal, and certificate templates) are managed by the design system and applied automatically to issued certificates.</InfoBanner>
            </div>
          </Card>
        </div>
      )}

      {tab === "Security" && (
        <div className="grid lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader title="Authentication & access" subtitle="Platform-wide security controls" />
            <div className="px-5 py-2">
              <Toggle label="Enforce multi-factor authentication" hint="Require MFA for all staff roles (placeholder)." defaultOn />
              <Toggle label="Single active session per user" hint="Block concurrent logins for the same account." defaultOn />
              <Toggle label="Browser lockdown for exams" hint="Kiosk / lockdown browser during delivery (placeholder)." />
              <Toggle label="Remote proctoring integration" hint="Enable live remote invigilation (placeholder)." />
            </div>
          </Card>
          <Card>
            <CardHeader title="Content protection" subtitle="Anti-leak and integrity controls" />
            <div className="px-5 py-2">
              <Toggle label="Screen watermarking" hint="Tile viewer identity across secure content." defaultOn />
              <Toggle label="Copy / print prevention" hint="Disable copy, print, and screenshot on secure screens." defaultOn />
              <div className="flex items-center justify-between gap-4 py-3 border-b border-navy-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-navy-800">Auto-save interval</p>
                  <p className="text-xs text-navy-400 mt-0.5">Candidate answer auto-save frequency.</p>
                </div>
                <select className="rounded-lg border border-navy-200 bg-white text-sm py-1.5 px-2.5">
                  <option>15 seconds</option>
                  <option>30 seconds</option>
                  <option>60 seconds</option>
                </select>
              </div>
            </div>
            <div className="px-5 pb-4">
              <InfoBanner tone="amber">Toggles are visual in this prototype. In production, changes here are governance-approved and written to the append-only audit log.</InfoBanner>
            </div>
          </Card>
        </div>
      )}

      {tab === "Quality Assurance" && (
        <div>
          <InfoBanner tone="teal">
            <span className="font-medium">Continuous quality assurance.</span> Each review runs on a fixed cadence with a named owner. Outputs feed governance committees and the internal audit programme.
          </InfoBanner>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
            {QA_WORKFLOWS.map((w) => (
              <Card key={w.name} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <Icon name="report" className="w-5 h-5 text-teal-600" />
                  <Badge tone={w.status === "in_review" ? "amber" : "blue"}>{w.status === "in_review" ? "In review" : "Scheduled"}</Badge>
                </div>
                <p className="text-sm font-semibold text-navy-800 mt-3">{w.name}</p>
                <p className="text-xs text-navy-400 mt-2">Next due <span className="text-navy-600">{w.due}</span></p>
                <p className="text-xs text-navy-400">Owner <span className="text-navy-600">{w.owner}</span></p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab === "Localization" && (
        <div className="grid lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader title="Languages" subtitle="Interface and content languages" />
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-navy-50 px-3 py-2.5">
                <span className="text-sm font-medium text-navy-800">English (LTR)</span>
                <Badge tone="green">Active</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-navy-50 px-3 py-2.5">
                <span className="text-sm font-medium text-navy-800">Arabic (RTL)</span>
                <Badge tone="amber">Planned</Badge>
              </div>
              <InfoBanner tone="blue">The platform is English-first, with full Arabic right-to-left (RTL) support planned. Certification content already supports bilingual delivery.</InfoBanner>
            </div>
          </Card>
          <Card>
            <CardHeader title="Direction preview" subtitle="Mock RTL toggle for layout preview" />
            <div className="px-5 py-4">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-navy-800">Right-to-left layout</p>
                  <p className="text-xs text-navy-400 mt-0.5">Preview how the interface mirrors for Arabic.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setRtl((v) => !v)}
                  className={`relative shrink-0 w-11 h-6 rounded-full transition ${rtl ? "bg-teal-600" : "bg-navy-200"}`}
                  aria-pressed={rtl}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${rtl ? "translate-x-5" : ""}`} />
                </button>
              </div>
              <div dir={rtl ? "rtl" : "ltr"} className="mt-2 rounded-lg border border-navy-100 p-4 text-sm text-navy-700">
                <p className="font-medium text-navy-800">The Financial Academy</p>
                <p className="text-navy-500 mt-1">Secure exam management platform — {rtl ? "RTL preview" : "LTR default"}.</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {tab === "Integrations" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {INTEGRATIONS.map((it) => (
            <Card key={it.name} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <span className="grid place-items-center w-9 h-9 rounded-lg bg-navy-50 text-teal-600">
                  <Icon name={it.icon} className="w-5 h-5" />
                </span>
                <StatusPill label={it.status} />
              </div>
              <p className="text-sm font-semibold text-navy-800 mt-3">{it.name}</p>
              <p className="text-xs text-navy-400 mt-1">{it.desc}</p>
              <div className="mt-3">
                <Button variant="secondary" className="w-full justify-center">
                  <Icon name="cog" className="w-4 h-4" />Configure
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
