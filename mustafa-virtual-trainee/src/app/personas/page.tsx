
import { useState } from "react";
import Link from "@/components/link";
import { useLang } from "@/components/providers";
import { PageHeader, Badge } from "@/components/ui";
import { personaList } from "@/lib/personas";
import type { PersonaMode } from "@/lib/types";

export default function PersonasPage() {
  const { t, locale } = useLang();
  const [selected, setSelected] = useState<PersonaMode>("socratic");
  const active = personaList.find((p) => p.mode === selected)!;

  const visLabel = (v: string) =>
    v === "trainer_private" ? (locale === "ar" ? "خاص بالمدرّب" : "Trainer private")
    : v === "participants" ? (locale === "ar" ? "ظاهر للمشاركين" : "Visible to participants")
    : (locale === "ar" ? "الاثنان" : "Both");

  return (
    <div>
      <PageHeader title={t("navPersonas")} subtitle={t("personasSubtitle")} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2">
            {personaList.map((p) => {
              const on = p.mode === selected;
              return (
                <button key={p.mode} onClick={() => setSelected(p.mode)}
                  className={`card card-pad text-start transition ${on ? "ring-2 ring-brand-500 shadow-glow" : "hover:shadow-glow"}`}>
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-xl">{p.icon}</span>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-ink">{locale === "ar" ? p.nameAr : p.name}</p>
                      <p className="truncate text-xs text-ink-soft">{locale === "ar" ? p.taglineAr : p.tagline}</p>
                    </div>
                  </div>
                  <div className="mt-3"><Badge color={p.visibility === "trainer_private" ? "gold" : "green"}>{visLabel(p.visibility)}</Badge></div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail */}
        <div className="lg:col-span-1">
          <div className="card card-pad sticky top-24">
            <div className="flex items-center gap-3">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-2xl">{active.icon}</span>
              <div>
                <p className="text-[11px] font-semibold text-gold-600">{t("personaSelected")}</p>
                <p className="font-extrabold text-ink">{locale === "ar" ? active.nameAr : active.name}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-ink-soft">{locale === "ar" ? active.descriptionAr : active.description}</p>

            <h4 className="mt-5 mb-2 text-sm font-bold text-ink">{t("sampleQuestions")}</h4>
            <ul className="space-y-2">
              {active.sampleQuestions.map((q, i) => (
                <li key={i} className="rounded-xl bg-brand-50 px-3 py-2 text-sm text-ink">{q}</li>
              ))}
            </ul>

            <Link href={`/simulation`} className="btn-primary mt-5 w-full text-sm">⚡ {t("navSimulation")}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
