
import { useAuth, useLang, type Permission } from "@/components/providers";
import { PageHeader, Badge } from "@/components/ui";
import type { Role } from "@/lib/types";

const rolePermsDisplay: Record<Role, Permission[]> = {
  admin: ["manage_programmes", "run_sessions", "manage_settings", "manage_users", "export_reports", "view"],
  programme_manager: ["manage_programmes", "export_reports", "view"],
  trainer: ["run_sessions", "export_reports", "view"],
  coordinator: ["export_reports", "view"],
  viewer: ["view"],
};

const permLabel: Record<Permission, { ar: string; en: string }> = {
  manage_programmes: { ar: "إدارة البرامج", en: "Manage programmes" },
  run_sessions: { ar: "تشغيل الجلسات", en: "Run sessions" },
  manage_settings: { ar: "إدارة الإعدادات", en: "Manage settings" },
  manage_users: { ar: "إدارة المستخدمين", en: "Manage users" },
  export_reports: { ar: "تصدير التقارير", en: "Export reports" },
  view: { ar: "اطّلاع", en: "View" },
};

export default function UsersPage() {
  const { t, locale } = useLang();
  const { users, user } = useAuth();

  return (
    <div>
      <PageHeader title={t("navUsers")} subtitle={t("usersSubtitle")} />

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-brand-50/60 text-start text-xs font-bold text-ink-soft">
              <tr>
                <th className="p-4 text-start">{locale === "ar" ? "المستخدم" : "User"}</th>
                <th className="p-4 text-start">{locale === "ar" ? "الدور" : "Role"}</th>
                <th className="p-4 text-start">{locale === "ar" ? "الصلاحيات" : "Permissions"}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-brand-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-full text-xs font-bold text-white" style={{ background: u.avatarColor }}>{(locale === "ar" ? u.nameAr : u.name).charAt(0)}</div>
                      <div>
                        <p className="font-semibold text-ink">{locale === "ar" ? u.nameAr : u.name}{user?.id === u.id && <span className="ms-2 text-[10px] text-brand-600">({locale === "ar" ? "أنت" : "you"})</span>}</p>
                        <p className="text-xs text-ink-soft">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4"><Badge color="brand">{t(`role_${u.role}`)}</Badge></td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1.5">
                      {rolePermsDisplay[u.role].map((p) => <Badge key={p} color="gray">{permLabel[p][locale]}</Badge>)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
