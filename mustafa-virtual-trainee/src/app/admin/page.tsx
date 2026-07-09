
import { useEffect, useState } from "react";
import { useLang } from "@/components/providers";
import { PageHeader, Select } from "@/components/ui";
import { store } from "@/lib/store";
import { defaultSettings } from "@/lib/data";
import type { AdminSettings, Tone } from "@/lib/types";

const tones: Tone[] = ["formal", "friendly", "executive", "youthful", "practical", "challenging", "reflective"];

export default function AdminPage() {
  const { t, locale } = useLang();
  const [s, setS] = useState<AdminSettings>(defaultSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => setS(store.getSettings()), []);
  const set = (k: keyof AdminSettings, v: unknown) => setS((prev) => ({ ...prev, [k]: v }));

  const save = () => { store.saveSettings(s); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const Toggle = ({ on, onClick }: { on: boolean; onClick: () => void }) => (
    <button onClick={onClick} className={`relative h-7 w-12 shrink-0 rounded-full transition ${on ? "bg-brand-600" : "bg-slate-300"}`}>
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${on ? "start-1" : "start-6"}`} />
    </button>
  );

  return (
    <div>
      <PageHeader title={t("navAdmin")} subtitle={t("adminSubtitle")}
        actions={<button className="btn-primary text-sm" onClick={save}>{t("save")}</button>} />

      {saved && <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">✓ {t("settingsSaved")}</div>}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Behavior */}
        <div className="card card-pad space-y-4">
          <h3 className="section-title">{locale === "ar" ? "سلوك مصطفى" : "Mustafa behavior"}</h3>
          <div><label className="label">{t("defaultTone")}</label><Select value={s.defaultTone} onChange={(e) => set("defaultTone", e.target.value)}>{tones.map((x) => <option key={x} value={x}>{t(`tone_${x}`)}</option>)}</Select></div>
          <div><label className="label">{t("defaultLanguage")}</label><Select value={s.defaultLanguage} onChange={(e) => set("defaultLanguage", e.target.value)}><option value="ar">{locale === "ar" ? "العربية" : "Arabic"}</option><option value="en">{locale === "ar" ? "الإنجليزية" : "English"}</option><option value="bilingual">{locale === "ar" ? "ثنائي" : "Bilingual"}</option></Select></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">{t("maxInterventions")}</label><input type="number" className="input" value={s.maxInterventionsPer10Min} onChange={(e) => set("maxInterventionsPer10Min", Number(e.target.value))} /></div>
            <div><label className="label">{t("minBetween")}</label><input type="number" className="input" value={s.minMinutesBetweenInterventions} onChange={(e) => set("minMinutesBetweenInterventions", Number(e.target.value))} /></div>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-brand-50/50 px-3 py-2.5">
            <span className="text-sm font-semibold text-ink">{t("autoPost")}</span>
            <Toggle on={s.autoPost} onClick={() => set("autoPost", !s.autoPost)} />
          </div>
          <div className="flex items-center justify-between rounded-xl bg-brand-50/50 px-3 py-2.5">
            <span className="text-sm font-semibold text-ink">{t("allowDevils")}</span>
            <Toggle on={s.allowDevilsAdvocate} onClick={() => set("allowDevilsAdvocate", !s.allowDevilsAdvocate)} />
          </div>
          <div className="flex items-center justify-between rounded-xl bg-brand-50/50 px-3 py-2.5">
            <span className="text-sm font-semibold text-ink">{t("mustafaVisible")}</span>
            <Toggle on={s.mustafaVisibleDefault} onClick={() => set("mustafaVisibleDefault", !s.mustafaVisibleDefault)} />
          </div>
        </div>

        {/* Terminology + branding */}
        <div className="space-y-6">
          <div className="card card-pad space-y-4">
            <h3 className="section-title">{locale === "ar" ? "المصطلحات" : "Terminology"}</h3>
            <div>
              <label className="label">{t("approvedTerminology")}</label>
              <textarea className="input min-h-[70px]" value={s.approvedTerminology.join("، ")} onChange={(e) => set("approvedTerminology", e.target.value.split(/[،,]/).map((x) => x.trim()).filter(Boolean))} />
            </div>
            <div>
              <label className="label">{t("restrictedWords")}</label>
              <textarea className="input min-h-[70px]" value={s.restrictedWords.join("، ")} onChange={(e) => set("restrictedWords", e.target.value.split(/[،,]/).map((x) => x.trim()).filter(Boolean))} />
            </div>
          </div>

          <div className="card card-pad space-y-4">
            <h3 className="section-title">{t("branding")}</h3>
            <div><label className="label">{locale === "ar" ? "اسم الجهة" : "Organization name"}</label><input className="input" value={s.organizationName} onChange={(e) => set("organizationName", e.target.value)} /></div>
            <div><label className="label">{locale === "ar" ? "اسم الجهة (عربي)" : "Organization name (Arabic)"}</label><input className="input" value={s.organizationNameAr} onChange={(e) => set("organizationNameAr", e.target.value)} /></div>
            <div className="flex items-center gap-3">
              <div><label className="label">{locale === "ar" ? "اللون الأساسي" : "Primary color"}</label><input type="color" className="h-11 w-20 rounded-lg border border-brand-200" value={s.primaryColor} onChange={(e) => set("primaryColor", e.target.value)} /></div>
              <div className="flex-1"><label className="label">{locale === "ar" ? "الشعار" : "Logo"}</label><button className="btn-outline w-full text-sm">⬆ {locale === "ar" ? "رفع الشعار" : "Upload logo"}</button></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
