"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth, useLang } from "@/components/providers";
import { PageHeader, Select } from "@/components/ui";
import { store, newId } from "@/lib/store";
import { label } from "@/lib/i18n";
import type {
  Programme, Sector, Platform, ProgrammeLevel, SessionLanguage, EngagementStyle, AgendaItem,
} from "@/lib/types";

const sectors: Sector[] = ["banking", "insurance", "capital_market", "fintech", "leadership", "compliance", "risk", "sales", "operations", "customer_experience"];
const platforms: Platform[] = ["zoom", "teams", "webex", "google_meet", "lms", "custom"];
const levels: ProgrammeLevel[] = ["beginner", "intermediate", "advanced", "executive"];
const styles: EngagementStyle[] = ["interactive", "reflective", "case_based", "socratic", "practical"];

export default function NewProgrammePage() {
  const { t, locale } = useLang();
  const { user } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "", nameAr: "", code: "", date: "2026-08-01T09:00",
    trainerName: user ? (locale === "ar" ? user.nameAr : user.name) : "",
    coordinatorName: "", targetAudience: "", sector: "compliance" as Sector,
    platform: "teams" as Platform, language: "bilingual" as SessionLanguage,
    level: "beginner" as ProgrammeLevel, duration: 180,
    participantProfile: "", sensitiveTopics: "", engagementStyle: "case_based" as EngagementStyle,
    mustafaVisible: true,
  });
  const [objectives, setObjectives] = useState<string[]>([""]);
  const [outcomes, setOutcomes] = useState<string[]>([""]);
  const [agenda, setAgenda] = useState<{ title: string; minutes: number }[]>([{ title: "", minutes: 40 }]);
  const [saved, setSaved] = useState(false);

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const ListEditor = ({ items, setItems, ph }: { items: string[]; setItems: (v: string[]) => void; ph: string }) => (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="flex gap-2">
          <input className="input" value={it} placeholder={`${ph} ${i + 1}`} onChange={(e) => { const c = [...items]; c[i] = e.target.value; setItems(c); }} />
          {items.length > 1 && <button type="button" className="btn-ghost px-2 text-red-600" onClick={() => setItems(items.filter((_, x) => x !== i))}>✕</button>}
        </div>
      ))}
      <button type="button" className="btn-ghost text-xs" onClick={() => setItems([...items, ""])}>＋ {t("addLine")}</button>
    </div>
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const programme: Programme = {
      id: newId("p"),
      name: form.name || form.nameAr,
      nameAr: form.nameAr || form.name,
      code: form.code || "FA-" + Math.floor(Math.random() * 900 + 100),
      date: form.date,
      trainerName: form.trainerName,
      coordinatorName: form.coordinatorName,
      targetAudience: form.targetAudience,
      sector: form.sector,
      platform: form.platform,
      language: form.language,
      level: form.level,
      objectives: objectives.filter(Boolean),
      outcomes: outcomes.filter(Boolean),
      agenda: agenda.filter((a) => a.title).map((a): AgendaItem => ({ id: newId("a"), title: a.title, minutes: a.minutes })),
      durationMinutes: Number(form.duration),
      participantProfile: form.participantProfile,
      sensitiveTopics: form.sensitiveTopics,
      engagementStyle: form.engagementStyle,
      mustafaVisible: form.mustafaVisible,
      createdBy: user?.id || "u_pm",
      createdAt: new Date().toISOString(),
    };
    store.addProgramme(programme);
    setSaved(true);
    setTimeout(() => router.push(`/programmes/${programme.id}`), 700);
  };

  return (
    <form onSubmit={submit}>
      <PageHeader title={t("navCreateProgramme")} subtitle={t("dashSubtitle")}
        actions={<button type="submit" className="btn-primary text-sm">{t("create")}</button>} />

      {saved && <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">✓ {t("programmeCreated")}</div>}

      <div className="space-y-6">
        {/* Basics */}
        <div className="card card-pad grid gap-4 sm:grid-cols-2">
          <div><label className="label">{t("progNameAr")}</label><input className="input" required value={form.nameAr} onChange={(e) => set("nameAr", e.target.value)} /></div>
          <div><label className="label">{t("progName")}</label><input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
          <div><label className="label">{t("progCode")}</label><input className="input" value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="FA-XXX-000" /></div>
          <div><label className="label">{t("progDate")}</label><input type="datetime-local" className="input" value={form.date} onChange={(e) => set("date", e.target.value)} /></div>
          <div><label className="label">{t("trainerName")}</label><input className="input" value={form.trainerName} onChange={(e) => set("trainerName", e.target.value)} /></div>
          <div><label className="label">{t("coordinatorName")}</label><input className="input" value={form.coordinatorName} onChange={(e) => set("coordinatorName", e.target.value)} /></div>
        </div>

        {/* Classification */}
        <div className="card card-pad grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div><label className="label">{t("sector")}</label><Select value={form.sector} onChange={(e) => set("sector", e.target.value)}>{sectors.map((s) => <option key={s} value={s}>{label(s, locale)}</option>)}</Select></div>
          <div><label className="label">{t("platform")}</label><Select value={form.platform} onChange={(e) => set("platform", e.target.value)}>{platforms.map((s) => <option key={s} value={s}>{label(s, locale)}</option>)}</Select></div>
          <div><label className="label">{t("sessionLanguage")}</label><Select value={form.language} onChange={(e) => set("language", e.target.value)}><option value="ar">{locale === "ar" ? "العربية" : "Arabic"}</option><option value="en">{locale === "ar" ? "الإنجليزية" : "English"}</option><option value="bilingual">{label("bilingual", locale)}</option></Select></div>
          <div><label className="label">{t("level")}</label><Select value={form.level} onChange={(e) => set("level", e.target.value)}>{levels.map((s) => <option key={s} value={s}>{label(s, locale)}</option>)}</Select></div>
          <div><label className="label">{t("engagementStyle")}</label><Select value={form.engagementStyle} onChange={(e) => set("engagementStyle", e.target.value)}>{styles.map((s) => <option key={s} value={s}>{label(s, locale)}</option>)}</Select></div>
          <div><label className="label">{t("duration")}</label><input type="number" className="input" value={form.duration} onChange={(e) => set("duration", e.target.value)} /></div>
          <div className="sm:col-span-2 lg:col-span-3"><label className="label">{t("targetAudience")}</label><input className="input" value={form.targetAudience} onChange={(e) => set("targetAudience", e.target.value)} /></div>
        </div>

        {/* Objectives & outcomes */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card card-pad"><label className="label">{t("objectives")}</label><ListEditor items={objectives} setItems={setObjectives} ph={locale === "ar" ? "هدف" : "Objective"} /></div>
          <div className="card card-pad"><label className="label">{t("outcomes")}</label><ListEditor items={outcomes} setItems={setOutcomes} ph={locale === "ar" ? "مخرج" : "Outcome"} /></div>
        </div>

        {/* Agenda */}
        <div className="card card-pad">
          <label className="label">{t("agenda")}</label>
          <div className="space-y-2">
            {agenda.map((a, i) => (
              <div key={i} className="flex gap-2">
                <input className="input flex-1" placeholder={`${locale === "ar" ? "بند" : "Item"} ${i + 1}`} value={a.title} onChange={(e) => { const c = [...agenda]; c[i] = { ...c[i], title: e.target.value }; setAgenda(c); }} />
                <input type="number" className="input w-24" value={a.minutes} onChange={(e) => { const c = [...agenda]; c[i] = { ...c[i], minutes: Number(e.target.value) }; setAgenda(c); }} />
                {agenda.length > 1 && <button type="button" className="btn-ghost px-2 text-red-600" onClick={() => setAgenda(agenda.filter((_, x) => x !== i))}>✕</button>}
              </div>
            ))}
            <button type="button" className="btn-ghost text-xs" onClick={() => setAgenda([...agenda, { title: "", minutes: 30 }])}>＋ {t("addAgendaItem")}</button>
          </div>
        </div>

        {/* Profile & sensitive */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card card-pad"><label className="label">{t("participantProfile")}</label><textarea className="input min-h-[90px]" value={form.participantProfile} onChange={(e) => set("participantProfile", e.target.value)} /></div>
          <div className="card card-pad"><label className="label">{t("sensitiveTopics")} <span className="text-ink-soft">({t("optional")})</span></label><textarea className="input min-h-[90px]" value={form.sensitiveTopics} onChange={(e) => set("sensitiveTopics", e.target.value)} /></div>
        </div>

        {/* Visibility */}
        <div className="card card-pad flex items-center justify-between gap-4">
          <div>
            <p className="font-bold text-ink">{t("mustafaVisible")}</p>
            <p className="text-xs text-ink-soft">{t("mustafaVisibleHint")}</p>
          </div>
          <button type="button" onClick={() => set("mustafaVisible", !form.mustafaVisible)}
            className={`relative h-7 w-12 rounded-full transition ${form.mustafaVisible ? "bg-brand-600" : "bg-slate-300"}`}>
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${form.mustafaVisible ? "start-1" : "start-6"}`} />
          </button>
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" className="btn-outline text-sm" onClick={() => router.push("/programmes")}>{t("cancel")}</button>
          <button type="submit" className="btn-primary text-sm">{t("create")}</button>
        </div>
      </div>
    </form>
  );
}
