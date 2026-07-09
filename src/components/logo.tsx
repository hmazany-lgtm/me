
import { useLang } from "./providers";

export function Logo({ compact = false }: { compact?: boolean }) {
  const { t, locale } = useLang();
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-sm">
        <span className="text-lg font-extrabold">{locale === "ar" ? "م" : "M"}</span>
        <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-gold-400" />
      </div>
      {!compact && (
        <div className="leading-tight">
          <p className="text-sm font-extrabold text-ink">{t("appName")}</p>
          <p className="text-[10px] font-medium text-ink-soft">{t("academy")}</p>
        </div>
      )}
    </div>
  );
}

// A friendly Mustafa "speech" avatar used across engagement surfaces
export function MustafaAvatar({ size = 40 }: { size?: number }) {
  return (
    <div
      className="grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm"
      style={{ width: size, height: size, fontSize: size * 0.5 }}
      aria-hidden
    >
      🤝
    </div>
  );
}
