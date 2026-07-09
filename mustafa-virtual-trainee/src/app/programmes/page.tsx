"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth, useLang } from "@/components/providers";
import { PageHeader, Badge, EmptyState } from "@/components/ui";
import { store } from "@/lib/store";
import { label } from "@/lib/i18n";
import type { Programme } from "@/lib/types";

export default function ProgrammesPage() {
  const { t, locale } = useLang();
  const { can } = useAuth();
  const [programmes, setProgrammes] = useState<Programme[]>([]);

  useEffect(() => setProgrammes(store.getProgrammes()), []);

  return (
    <div>
      <PageHeader
        title={t("navProgrammes")}
        subtitle={t("dashSubtitle")}
        actions={can("manage_programmes") && <Link href="/programmes/new" className="btn-primary text-sm">＋ {t("navCreateProgramme")}</Link>}
      />

      {programmes.length === 0 ? (
        <EmptyState text={t("noProgrammes")} action={can("manage_programmes") && <Link href="/programmes/new" className="btn-primary text-sm">{t("navCreateProgramme")}</Link>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {programmes.map((p) => (
            <Link key={p.id} href={`/programmes/${p.id}`} className="card card-pad transition hover:shadow-glow">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-bold text-ink">{locale === "ar" ? p.nameAr : p.name}</h3>
                  <p className="text-xs text-ink-soft">{p.code}</p>
                </div>
                <Badge color={p.mustafaVisible ? "green" : "gray"}>
                  {p.mustafaVisible ? (locale === "ar" ? "مصطفى ظاهر" : "Mustafa visible") : (locale === "ar" ? "خاص بالمدرّب" : "Trainer-only")}
                </Badge>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-ink-soft">{p.participantProfile}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge>{label(p.sector, locale)}</Badge>
                <Badge color="gold">{label(p.level, locale)}</Badge>
                <Badge color="gray">{label(p.platform, locale)}</Badge>
                <Badge color="gray">{p.durationMinutes} {t("minutes")}</Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
