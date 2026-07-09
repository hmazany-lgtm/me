"use client";

import { useState } from "react";
import { useLang } from "./providers";
import { Badge, CopyButton } from "./ui";
import { MustafaAvatar } from "./logo";
import { label } from "@/lib/i18n";
import type { Suggestion } from "@/lib/types";

export function SuggestionCard({
  s, onDecision,
}: { s: Suggestion; onDecision?: (id: string, status: Suggestion["status"]) => void }) {
  const { t, locale } = useLang();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(locale === "ar" ? s.textAr : s.textEn);
  const [status, setStatus] = useState<Suggestion["status"]>(s.status);

  const decide = (st: Suggestion["status"]) => { setStatus(st); onDecision?.(s.id, st); };

  const statusBadge = {
    pending: <Badge color="amber">{t("statusPending")}</Badge>,
    approved: <Badge color="green">{t("statusApproved")}</Badge>,
    rejected: <Badge color="red">{t("statusRejected")}</Badge>,
    posted: <Badge color="brand">{t("statusPosted")}</Badge>,
  }[status];

  const confPct = Math.round(s.confidence * 100);

  return (
    <div className={`card card-pad transition ${status === "rejected" ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-3">
        <MustafaAvatar size={38} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge color="brand">{label(s.type, locale)}</Badge>
            <Badge color="gray">{label(`delivery_${s.delivery}`, locale)}</Badge>
            <Badge color={s.audience === "trainer_private" ? "gold" : "green"}>{t(`audience_${s.audience}`)}</Badge>
            <span className="ms-auto">{statusBadge}</span>
          </div>

          {editing ? (
            <textarea className="input mt-3 min-h-[70px]" value={text} onChange={(e) => setText(e.target.value)} />
          ) : (
            <p className="mt-3 text-[15px] leading-relaxed text-ink">{text}</p>
          )}

          <p className="mt-2 text-xs text-ink-soft"><span className="font-semibold">{t("purpose")}:</span> {locale === "ar" ? s.purposeAr : s.purposeEn}</p>

          {/* Confidence */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[11px] font-semibold text-ink-soft">{t("confidence")}</span>
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-brand-50">
              <div className="h-full rounded-full bg-brand-500" style={{ width: `${confPct}%` }} />
            </div>
            <span className="text-[11px] font-bold text-brand-700">{confPct}%</span>
          </div>

          {/* Actions */}
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-brand-50 pt-3">
            {status !== "posted" && (
              <>
                <button className="btn-primary px-3 py-1.5 text-xs" onClick={() => decide("posted")}>✓ {t("post")}</button>
                <button className="btn-outline px-3 py-1.5 text-xs" onClick={() => decide("approved")}>{t("approve")}</button>
                <button className="btn-ghost px-3 py-1.5 text-xs" onClick={() => setEditing((v) => !v)}>{editing ? t("save") : t("edit")}</button>
                <button className="btn-ghost px-3 py-1.5 text-xs text-red-600" onClick={() => decide("rejected")}>{t("reject")}</button>
              </>
            )}
            <span className="ms-auto"><CopyButton text={text} labelCopy={t("copy")} labelCopied={t("copied")} /></span>
          </div>
        </div>
      </div>
    </div>
  );
}
