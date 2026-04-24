"use client";

import Link from "next/link";
import { useAdminStore } from "@/lib/store";
import { BLOCK_LABELS } from "@/lib/types";

export default function AdminOverview() {
  const { questions } = useAdminStore();

  const published = questions.filter((q) => q.status === "published").length;
  const draft = questions.filter((q) => q.status === "draft").length;
  const review = questions.filter((q) => q.status === "review").length;

  const blockCounts = Object.entries(BLOCK_LABELS).map(([key, label]) => ({
    block: key,
    label: label.en,
    labelAr: label.ar,
    count: questions.filter((q) => q.block === key).length,
  }));

  const stats = [
    { label: "Total Questions", labelAr: "إجمالي الأسئلة", value: questions.length, icon: "⊞", color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Published", labelAr: "منشور", value: published, icon: "✓", color: "text-green-600", bg: "bg-green-50" },
    { label: "In Review", labelAr: "قيد المراجعة", value: review, icon: "◎", color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Draft", labelAr: "مسودة", value: draft, icon: "✎", color: "text-slate-600", bg: "bg-slate-100" },
  ];

  const quickActions = [
    { href: "/admin/questions", icon: "⊞", label: "Add New Question", labelAr: "إضافة سؤال جديد", desc: "Create and edit survey questions", descAr: "إنشاء وتحرير أسئلة الاستبيان" },
    { href: "/admin/logic", icon: "⋙", label: "Edit Logic Rules", labelAr: "تحرير قواعد الشروط", desc: "Set conditional visibility rules", descAr: "تحديد قواعد الظهور الشرطي" },
    { href: "/admin/preview", icon: "◉", label: "Preview Survey", labelAr: "معاينة الاستبيان", desc: "Preview as any respondent role", descAr: "معاينة الاستبيان بأي دور" },
    { href: "/admin/analytics", icon: "◫", label: "View Analytics", labelAr: "عرض التحليلات", desc: "Response data and insights", descAr: "بيانات الاستجابات والرؤى" },
    { href: "/admin/export", icon: "⤓", label: "Export Data", labelAr: "تصدير البيانات", desc: "Excel, CSV, JSON, Power BI", descAr: "إكسل، CSV، JSON، Power BI" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500 text-sm mt-1">TFA Training Landscape Study — Admin Control Center</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-slate-200">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center text-lg ${s.color} mb-3`}>
              {s.icon}
            </div>
            <div className="text-2xl font-bold text-slate-900">{s.value}</div>
            <div className="text-sm text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Survey Structure */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-800 mb-4">Survey Structure — 5 Blocks</h2>
        <div className="space-y-3">
          {blockCounts.map((b) => (
            <div key={b.block} className="flex items-center gap-4">
              <div className="w-40 text-sm text-slate-600 font-medium">{b.label}</div>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.round((b.count / questions.length) * 100)}%`,
                    background: "linear-gradient(90deg, #1a3a6b, #2563eb)",
                  }}
                />
              </div>
              <div className="text-sm font-semibold text-slate-700 w-8 text-right">{b.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-semibold text-slate-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all group"
            >
              <div className="text-2xl mb-3 group-hover:scale-110 transition-transform inline-block">
                {a.icon}
              </div>
              <div className="font-semibold text-slate-800 text-sm">{a.label}</div>
              <div className="text-slate-500 text-xs mt-1">{a.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Workflow status */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-800 mb-4">Publishing Workflow</h2>
        <div className="flex items-center gap-2 text-sm">
          {["Draft", "Review", "Published", "Live"].map((step, i, arr) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                  step === "Published" || step === "Live"
                    ? "bg-green-100 text-green-700"
                    : step === "Review"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {step === "Live" && <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>}
                {step}
              </div>
              {i < arr.length - 1 && <span className="text-slate-300">→</span>}
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-3">
          Version history is tracked. Changing a question never deletes historical responses.
        </p>
      </div>
    </div>
  );
}
