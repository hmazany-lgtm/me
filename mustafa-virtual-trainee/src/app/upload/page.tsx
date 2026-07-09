"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/components/providers";
import { PageHeader, Badge } from "@/components/ui";
import { usePrograms, ProgrammePicker } from "@/components/programme-picker";

type FileMeta = { name: string; type: string; sizeKb: number };

export default function UploadPage() {
  const { t, locale } = useLang();
  const router = useRouter();
  const { programmes, selectedId, setSelectedId } = usePrograms();
  const [files, setFiles] = useState<FileMeta[]>([]);
  const [pasted, setPasted] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFiles = (list: FileList | null) => {
    if (!list) return;
    const metas = Array.from(list).map((f) => ({ name: f.name, type: f.type || f.name.split(".").pop() || "file", sizeKb: Math.round(f.size / 1024) }));
    setFiles((prev) => [...prev, ...metas]);
  };

  const analyze = () => {
    setBusy(true);
    setTimeout(() => router.push(`/analysis?p=${selectedId}${pasted ? "&pasted=1" : ""}`), 800);
  };

  return (
    <div>
      <PageHeader title={t("uploadTitle")} subtitle={t("uploadHint")} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {programmes.length > 0 && (
            <div className="card card-pad"><ProgrammePicker programmes={programmes} value={selectedId} onChange={setSelectedId} /></div>
          )}

          {/* Dropzone */}
          <div
            className="card flex cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed border-brand-200 bg-brand-50/30 py-14 text-center transition hover:border-brand-400"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); onFiles(e.dataTransfer.files); }}
          >
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-2xl shadow-sm">⬆</div>
            <p className="text-sm font-semibold text-ink">{t("dropHere")}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {["PDF", "Word", "PowerPoint", "Excel", "Text"].map((x) => <Badge key={x} color="gray">{x}</Badge>)}
            </div>
            <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
          </div>

          {files.length > 0 && (
            <div className="card card-pad space-y-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl bg-brand-50/50 px-3 py-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-sm">📄</span>
                  <span className="flex-1 truncate text-sm text-ink">{f.name}</span>
                  <span className="text-xs text-ink-soft">{f.sizeKb} KB</span>
                  <button className="btn-ghost px-2 text-red-600" onClick={() => setFiles(files.filter((_, x) => x !== i))}>✕</button>
                </div>
              ))}
            </div>
          )}

          <div className="card card-pad">
            <label className="label">{t("pasteAgenda")}</label>
            <textarea className="input min-h-[120px]" value={pasted} onChange={(e) => setPasted(e.target.value)}
              placeholder={locale === "ar" ? "الصق الأجندة أو مخطط البرنامج هنا…" : "Paste the agenda or programme outline here…"} />
          </div>

          <button className="btn-primary text-sm" disabled={busy || (!files.length && !pasted)} onClick={analyze}>
            {busy ? t("analyzing") : `◉ ${t("analyze")}`}
          </button>
        </div>

        <div className="lg:col-span-1">
          <div className="card card-pad bg-gradient-to-br from-brand-50 to-white">
            <p className="text-sm font-bold text-ink">{locale === "ar" ? "ماذا سيستخرج مصطفى؟" : "What Mustafa extracts"}</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-soft">
              {[t("analysisSummary"), t("analysisThemes"), t("analysisChallenges"), t("analysisMoments"), t("analysisQuestions"), t("analysisActivities")].map((x) => (
                <li key={x} className="flex gap-2"><span className="text-brand-500">◆</span>{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
