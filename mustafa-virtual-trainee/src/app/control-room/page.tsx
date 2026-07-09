
import { useEffect, useState } from "react";
import Link from "@/components/link";
import { useLang } from "@/components/providers";
import { PageHeader, ScoreRing, Badge, Meter } from "@/components/ui";
import { MustafaAvatar } from "@/components/logo";
import { usePrograms, ProgrammePicker } from "@/components/programme-picker";
import { SuggestionCard } from "@/components/suggestion-card";
import { runEngine } from "@/lib/ai/engine";
import { personas } from "@/lib/personas";
import { store } from "@/lib/store";
import { label } from "@/lib/i18n";
import type { EngineResult, PersonaMode } from "@/lib/types";

export default function ControlRoomPage() {
  const { t, locale } = useLang();
  const { programmes, selectedId, setSelectedId, selected } = usePrograms();

  const [persona, setPersona] = useState<PersonaMode>("engagement_coach");
  const [minutes, setMinutes] = useState(35);
  const [sinceLast, setSinceLast] = useState(7);
  const [engagement, setEngagement] = useState<"low" | "medium" | "high">("medium");
  const [result, setResult] = useState<EngineResult | null>(null);
  const [live, setLive] = useState(false);

  const compute = () => {
    if (!selected) return;
    const section = selected.agenda[Math.min(selected.agenda.length - 1, Math.floor(minutes / 45))]?.title;
    setResult(runEngine({
      programme: selected, currentAgendaSection: section, engagementLevel: engagement,
      minutesElapsed: minutes, minutesSinceLastInteraction: sinceLast, persona, tone: "formal", locale,
    }));
  };

  useEffect(compute, [selected, minutes, sinceLast, engagement, persona, locale]);

  // "Live" clock: advance minutes automatically
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => { setMinutes((m) => m + 1); setSinceLast((s) => s + 1); }, 2500);
    return () => clearInterval(id);
  }, [live]);

  const currentSection = selected?.agenda[Math.min((selected?.agenda.length || 1) - 1, Math.floor(minutes / 45))]?.title || "—";
  const chatSug = result?.suggestions.find((s) => s.delivery === "chat");
  const verbalSug = result?.suggestions.find((s) => s.delivery === "verbal");
  const actSug = result?.suggestions.find((s) => s.delivery === "poll" || s.delivery === "breakout");
  const trainerPrivate = result?.suggestions.filter((s) => s.audience === "trainer_private") || [];

  return (
    <div>
      <PageHeader
        title={t("navControlRoom")} subtitle={t("controlRoomSubtitle")}
        actions={
          <button onClick={() => setLive((v) => !v)} className={live ? "btn-danger text-sm" : "btn-primary text-sm"}>
            {live ? `■ ${locale === "ar" ? "إيقاف" : "Stop"}` : `▶ ${locale === "ar" ? "بث حي" : "Go live"}`}
          </button>
        }
      />

      {programmes.length > 0 && (
        <div className="card card-pad mb-6 grid gap-4 sm:grid-cols-3">
          <ProgrammePicker programmes={programmes} value={selectedId} onChange={setSelectedId} />
          <div>
            <label className="label">{t("persona")}</label>
            <select className="input" value={persona} onChange={(e) => setPersona(e.target.value as PersonaMode)}>
              {Object.values(personas).map((p) => <option key={p.mode} value={p.mode}>{locale === "ar" ? p.nameAr : p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">{t("participationLevel")}</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(["low", "medium", "high"] as const).map((lv) => (
                <button key={lv} onClick={() => setEngagement(lv)} className={`rounded-lg border px-1 py-2 text-xs font-semibold ${engagement === lv ? "border-brand-500 bg-brand-50 text-brand-700" : "border-brand-100 text-ink-soft"}`}>{t(lv)}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {result && selected && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column: health + metrics */}
          <div className="space-y-6">
            <div className="card card-pad flex flex-col items-center gap-3 text-center">
              <p className="text-xs font-semibold text-ink-soft">{t("engagementHealth")}</p>
              <ScoreRing value={result.engagementScore} size={128} />
              <Badge color={result.energyLevel === "high" ? "green" : result.energyLevel === "medium" ? "gold" : "red"}>
                {t("energyLevel")}: {t(result.energyLevel)}
              </Badge>
              <p className="text-sm text-ink">{locale === "ar" ? result.headlineAr : result.headlineEn}</p>
            </div>

            <div className="card card-pad space-y-4">
              <div>
                <p className="mb-1 text-xs font-semibold text-ink-soft">{t("currentTopic")}</p>
                <p className="text-sm font-bold text-ink">{currentSection}</p>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs"><span className="text-ink-soft">{t("minsElapsed")}</span><span className="font-bold text-ink" dir="ltr">{minutes} / {selected.durationMinutes}</span></div>
                <Meter value={(minutes / selected.durationMinutes) * 100} color="#0f7a62" />
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs"><span className="text-ink-soft">{t("sinceLastInteraction")}</span><span className={`font-bold ${sinceLast >= 6 ? "text-red-600" : "text-ink"}`}>{sinceLast} {t("minutes")}</span></div>
                <Meter value={Math.min(100, sinceLast * 12)} color={sinceLast >= 6 ? "#dc2626" : "#c6902a"} />
              </div>
            </div>

            {/* Trainer private assistant */}
            <div className="card card-pad border-gold-200 bg-gold-50/40">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-lg">🎧</span>
                <h3 className="text-sm font-bold text-gold-800">{locale === "ar" ? "مساعد المدرّب الخاص" : "Trainer Private Assistant"}</h3>
              </div>
              <div className="space-y-2">
                {(trainerPrivate.length ? trainerPrivate : result.suggestions.slice(0, 2)).map((s) => (
                  <p key={s.id} className="rounded-xl bg-white px-3 py-2 text-sm text-ink">{locale === "ar" ? s.textAr : s.textEn}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Middle + right: suggestions */}
          <div className="space-y-6 lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { title: t("suggestedChat"), s: chatSug, icon: "💬" },
                { title: t("suggestedVerbal"), s: verbalSug, icon: "🗣️" },
                { title: t("suggestedActivity"), s: actSug, icon: "◆" },
              ].map((c) => (
                <div key={c.title} className="card card-pad">
                  <p className="mb-2 text-xs font-semibold text-ink-soft">{c.icon} {c.title}</p>
                  <p className="text-sm text-ink">{c.s ? (locale === "ar" ? c.s.textAr : c.s.textEn) : t("none")}</p>
                </div>
              ))}
            </div>

            <div className="card card-pad bg-gradient-to-br from-brand-600 to-brand-800 text-white">
              <div className="flex items-center gap-3">
                <MustafaAvatar />
                <div>
                  <p className="text-xs text-brand-100">{t("recommendedAction")}</p>
                  <p className="font-bold">{locale === "ar" ? result.recommendedActionAr : result.recommendedActionEn}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="section-title mb-3">{t("nextIntervention")}</h3>
              <div className="space-y-3">
                {result.suggestions.map((s) => (
                  <SuggestionCard key={s.id} s={s} onDecision={(id, st) => store.setDecision(id, st)} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {!result && (
        <div className="card card-pad text-center text-sm text-ink-soft">
          {t("selectProgrammeFirst")} <Link href="/programmes/new" className="text-brand-700 underline">{t("navCreateProgramme")}</Link>
        </div>
      )}
    </div>
  );
}
