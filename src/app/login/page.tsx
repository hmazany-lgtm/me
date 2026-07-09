
import { useRouter } from "@/lib/router";
import { useAuth, useLang } from "@/components/providers";
import { Logo } from "@/components/logo";
import Link from "@/components/link";

export default function LoginPage() {
  const { t, locale, toggle } = useLang();
  const { users, login } = useAuth();
  const router = useRouter();

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand side */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-700 to-brand-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -bottom-20 -end-20 h-80 w-80 rounded-full bg-gold-400/20 blur-3xl" />
        <Link href="/"><div className="text-white [&_p]:text-white [&_.text-ink]:text-white [&_.text-ink-soft]:text-brand-100"><Logo /></div></Link>
        <div className="max-w-md">
          <h1 className="text-3xl font-extrabold leading-tight">{t("heroTitle")}</h1>
          <p className="mt-4 text-brand-100">{t("heroSubtitle")}</p>
        </div>
        <p className="text-xs text-brand-200">© 2026 {t("academy")}</p>
      </div>

      {/* Form side */}
      <div className="flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center justify-between">
            <Link href="/"><Logo /></Link>
            <button onClick={toggle} className="btn-outline px-3 py-1.5 text-xs">{locale === "ar" ? "English" : "العربية"}</button>
          </div>

          <div className="card card-pad">
            <h2 className="text-xl font-extrabold text-ink">{t("navLogin")}</h2>
            <p className="mt-1 text-sm text-ink-soft">
              {locale === "ar" ? "اختر دورًا للدخول إلى العرض التجريبي." : "Choose a role to enter the demo."}
            </p>

            <div className="mt-5 space-y-2">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => { login(u); router.push("/dashboard"); }}
                  className="flex w-full items-center gap-3 rounded-xl border border-brand-100 p-3 text-start transition hover:border-brand-300 hover:bg-brand-50"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-full text-sm font-bold text-white" style={{ background: u.avatarColor }}>
                    {(locale === "ar" ? u.nameAr : u.name).charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-ink">{locale === "ar" ? u.nameAr : u.name}</p>
                    <p className="text-xs text-ink-soft">{t(`role_${u.role}`)} · {u.email}</p>
                  </div>
                  <span className="text-ink-soft">→</span>
                </button>
              ))}
            </div>

            <p className="mt-4 text-center text-[11px] text-ink-soft">
              {locale === "ar" ? "مصادقة تجريبية — لا تُخزَّن بيانات حقيقية." : "Mock authentication — no real credentials stored."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
