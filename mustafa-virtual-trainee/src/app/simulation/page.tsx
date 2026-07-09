
import { useState } from "react";
import { useLang } from "@/components/providers";
import { PageHeader, ScoreRing, Select, Badge } from "@/components/ui";
import { MustafaAvatar } from "@/components/logo";
import { usePrograms, ProgrammePicker } from "@/components/programme-picker";
import { SuggestionCard } from "@/components/suggestion-card";
import { personaList } from "@/lib/personas";
import { store } from "@/lib/store";
import { runEngine } from "@/lib/ai/engine";
import { label } from "@/lib/i18n";
import type { EngineResult, PersonaMode, Tone, EngineInput } from "@/lib/types";

const tones: Tone[] = ["formal", "friendly", "executive", "youthful", "practical", "challenging", "reflective"];

export default function SimulationPage() {
  const { t, locale } = useLang();
  const { programmes, selectedId, setSelectedId, selected } = usePrograms();

  const [persona, setPersona] = useState<PersonaMode>("socratic");
  const [tone, setTone] = useState<Tone>("formal");
  const [section, setSection] = useState("");
  const [happening, setHappening] = useState("");
  const [chat, setChat] = useState("");
  const [engagement, setEngagement] = useState<"low" | "medium" | "high">("medium");
  const [minutes, setMinutes] = useState(25);
  const [sinceLast, setSinceLast] = useState(6);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EngineResult | null>(null);

  const ask = async () => {
    if (!selected) return;
    setLoading(true);
    setResult(null);
    const input: EngineInput = {
      programme: selected,
      currentAgendaSection: section,
      transcript: happening,
      chatComments: chat,
      engagementLevel: engagement,
      minutesElapsed: minutes,
      minutesSinceLastInteraction: sinceLast,
      persona,
      tone,
      locale,
    };
    // Run the engagement engine directly (client-side). Swapped from a Next.js
    // API route during the migration to Vite; see src/lib/ai/provider.ts for
    // the hosted-model integration point.
    const data = runEngine(input);
    // small delay for perceived "thinking"
    setTimeout(() => { setResult(data); setLoading(false); }, 500);
  };

  return (
    <div>
      <PageHeader title={t("simTitle")} subtitle={t("simSubtitle")} />

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Input panel */}
        <div className="space-y-4 lg:col-span-2">
          <div className="card card-pad space-y-4">
            {programmes.length > 0 && <ProgrammePicker programmes={programmes} value={selectedId} onChange={setSelectedId} />}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">{t("persona")}</label>
                <Select value={persona} onChange={(e) => setPersona(e.target.value as PersonaMode)}>
                  {personaList.map((p) => <option key={p.mode} value={p.mode}>{locale === "ar" ? p.nameAr : p.name}</option>)}
                </Select>
              </div>
              <div>
                <label className="label">{t("tone")}</label>
                <Select value={tone} onChange={(e) => setTone(e.target.value as Tone)}>
                  {tones.map((tn) => <option key={tn} value={tn}>{t(`tone_${tn}`)}</option>)}
                </Select>
              </div>
            </div>

            <div>
              <label className="label">{t("currentSection")}</label>
              {selected ? (
                <Select value={section} onChange={(e) => setSection(e.target.value)}>
                  <option value="">—</option>
                  {selected.agenda.map((a) => <option key={a.id} value={a.title}>{a.title}</option>)}
                </Select>
              ) : <input className="input" value={section} onChange={(e) => setSection(e.target.value)} />}
            </div>

            <div>
              <label className="label">{t("whatsHappening")}</label>
              <textarea className="input min-h-[80px]" value={happening} onChange={(e) => setHappening(e.target.value)}
                placeholder={locale === "ar" ? "مثال: المدرّب يشرح مؤشرات الاشتباه والمشاركون صامتون." : "e.g. The trainer is explaining red flags and participants are quiet."} />
            </div>

            <div>
              <label className="label">{t("pasteChat")}</label>
              <textarea className="input min-h-[60px]" value={chat} onChange={(e) => setChat(e.target.value)} />
            </div>

            <div>
              <label className="label">{t("participationLevel")}</label>
              <div className="grid grid-cols-3 gap-2">
                {(["low", "medium", "high"] as const).map((lv) => (
                  <button key={lv} type="button" onClick={() => setEngagement(lv)}
                    className={`rounded-xl border px-2 py-2 text-xs font-semibold transition ${engagement === lv ? "border-brand-500 bg-brand-50 text-brand-700" : "border-brand-100 text-ink-soft"}`}>
                    {t(lv)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">{t("minsElapsed")}</label><input type="number" className="input" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} /></div>
              <div><label className="label">{t("sinceLastInteraction")} ({t("minutes")})</label><input type="number" className="input" value={sinceLast} onChange={(e) => setSinceLast(Number(e.target.value))} /></div>
            </div>

            <button onClick={ask} disabled={!selected || loading} className="btn-primary w-full text-sm">
              {loading ? t("thinking") : `⚡ ${t("askMustafa")}`}
            </button>
          </div>
        </div>

        {/* Output panel */}
        <div className="lg:col-span-3">
          {loading && (
            <div className="card card-pad flex items-center gap-3">
              <MustafaAvatar />
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => <span key={i} className="h-2.5 w-2.5 animate-pulse-soft rounded-full bg-brand-400" style={{ animationDelay: `${i * 0.2}s` }} />)}
              </div>
              <span className="text-sm text-ink-soft">{t("thinking")}</span>
            </div>
          )}

          {!loading && !result && (
            <div className="card card-pad flex flex-col items-center gap-3 py-16 text-center">
              <MustafaAvatar size={56} />
              <p className="text-sm text-ink-soft">{locale === "ar" ? "صف ما يحدث في الجلسة ثم اضغط \"اسأل مصطفى\"." : 'Describe what is happening and press "Ask Mustafa".'}</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="card card-pad flex flex-col items-center gap-4 sm:flex-row">
                <ScoreRing value={result.engagementScore} label={t("engagementHealth")} />
                <div className="flex-1">
                  <p className="text-sm font-bold text-ink">{locale === "ar" ? result.headlineAr : result.headlineEn}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge color={result.energyLevel === "high" ? "green" : result.energyLevel === "medium" ? "gold" : "red"}>
                      {t("energyLevel")}: {t(result.energyLevel)}
                    </Badge>
                    <Badge color="brand">{result.suggestions.length} {locale === "ar" ? "اقتراح" : "suggestions"}</Badge>
                  </div>
                  <p className="mt-3 rounded-xl bg-brand-50 px-3 py-2 text-sm text-ink">
                    <span className="font-semibold">{t("recommendedAction")}: </span>
                    {locale === "ar" ? result.recommendedActionAr : result.recommendedActionEn}
                  </p>
                </div>
              </div>

              <h3 className="section-title">{t("navInterventions")}</h3>
              {result.suggestions.map((s) => (
                <SuggestionCard key={s.id} s={s} onDecision={(id, st) => store.setDecision(id, st)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
