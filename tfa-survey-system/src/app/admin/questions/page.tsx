"use client";

import { useState } from "react";
import { useAdminStore } from "@/lib/store";
import {
  SurveyQuestion,
  QuestionOption,
  RespondentRole,
  Sector,
  SurveyBlock,
  QuestionType,
  QuestionStatus,
  ROLE_LABELS,
  SECTOR_LABELS,
  BLOCK_LABELS,
} from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

// ─── DnD-sortable question list (simple CSS drag) ─────────────────────────────

const BLOCKS: SurveyBlock[] = [
  "market_demand",
  "training_volume",
  "external_providers",
  "future_trends",
  "strategic_partnership",
];
const ROLES: RespondentRole[] = ["ld_hr", "finance", "business_leader", "regulator", "government", "vendor"];
const SECTORS: Sector[] = ["banking", "insurance", "capital_markets", "financing", "payments", "government", "training_provider", "other"];
const TYPES: QuestionType[] = ["single_choice", "multiple_choice", "short_answer", "number_range", "rating_scale", "dropdown", "conditional"];
const STATUSES: QuestionStatus[] = ["draft", "review", "published", "archived"];

const TYPE_LABELS: Record<QuestionType, string> = {
  single_choice: "Single Choice",
  multiple_choice: "Multiple Choice",
  short_answer: "Short Answer",
  number_range: "Number Range",
  rating_scale: "Rating Scale 1–5",
  dropdown: "Dropdown",
  conditional: "Conditional",
};

function StatusBadge({ status }: { status: QuestionStatus }) {
  return (
    <span className={`badge badge-${status}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function blankQuestion(): SurveyQuestion {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    block: "market_demand",
    order: 999,
    type: "single_choice",
    status: "draft",
    textEn: "",
    textAr: "",
    whyItMatters: "",
    options: [
      { id: uuidv4(), value: "opt1", labelEn: "", labelAr: "" },
      { id: uuidv4(), value: "opt2", labelEn: "", labelAr: "" },
    ],
    visibleToRoles: ["ld_hr"],
    visibleToSectors: [...SECTORS],
    required: true,
    version: 1,
    createdAt: now,
    updatedAt: now,
  };
}

// ─── Option Editor ────────────────────────────────────────────────────────────

function OptionEditor({
  options,
  onChange,
}: {
  options: QuestionOption[];
  onChange: (opts: QuestionOption[]) => void;
}) {
  const update = (id: string, field: keyof QuestionOption, val: string | boolean) => {
    onChange(options.map((o) => (o.id === id ? { ...o, [field]: val } : o)));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Answer Options</label>
        <button
          type="button"
          onClick={() =>
            onChange([
              ...options,
              { id: uuidv4(), value: `opt${options.length + 1}`, labelEn: "", labelAr: "" },
            ])
          }
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          + Add Option
        </button>
      </div>
      <div className="space-y-2">
        {options.map((opt, i) => (
          <div key={opt.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
            <input
              className="text-sm px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none"
              placeholder={`Option ${i + 1} (English)`}
              value={opt.labelEn}
              onChange={(e) => update(opt.id, "labelEn", e.target.value)}
            />
            <input
              className="text-sm px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none text-right"
              placeholder={`الخيار ${i + 1} (Arabic)`}
              value={opt.labelAr}
              onChange={(e) => update(opt.id, "labelAr", e.target.value)}
              dir="rtl"
            />
            <button
              type="button"
              onClick={() => onChange(options.filter((o) => o.id !== opt.id))}
              className="text-slate-300 hover:text-red-400 text-lg leading-none px-1"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Question Form ────────────────────────────────────────────────────────────

function QuestionForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: SurveyQuestion;
  onSave: (q: SurveyQuestion) => void;
  onCancel: () => void;
}) {
  const [q, setQ] = useState<SurveyQuestion>(initial);

  const update = (field: keyof SurveyQuestion, val: unknown) =>
    setQ((prev) => ({ ...prev, [field]: val }));

  const toggleRole = (r: RespondentRole) => {
    const cur = q.visibleToRoles;
    update("visibleToRoles", cur.includes(r) ? cur.filter((x) => x !== r) : [...cur, r]);
  };

  const toggleSector = (s: Sector) => {
    const cur = q.visibleToSectors;
    update("visibleToSectors", cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]);
  };

  const showOptions = ["single_choice", "multiple_choice", "dropdown"].includes(q.type);
  const showScale = q.type === "rating_scale";
  const showRange = q.type === "number_range";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">
          {initial.textEn ? "Edit Question" : "New Question"}
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(q)}
            className="px-4 py-2 text-sm rounded-lg text-white font-semibold"
            style={{ background: "linear-gradient(135deg, #0a1628, #1a3a6b)" }}
          >
            Save Question
          </button>
        </div>
      </div>

      {/* Block + Type + Status row */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Block</label>
          <select
            className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none"
            value={q.block}
            onChange={(e) => update("block", e.target.value as SurveyBlock)}
          >
            {BLOCKS.map((b) => (
              <option key={b} value={b}>{BLOCK_LABELS[b].en}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Type</label>
          <select
            className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none"
            value={q.type}
            onChange={(e) => update("type", e.target.value as QuestionType)}
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>{TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Status</label>
          <select
            className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none"
            value={q.status}
            onChange={(e) => update("status", e.target.value as QuestionStatus)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Question text — bilingual */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
            Question Text (English)
          </label>
          <textarea
            rows={3}
            className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none resize-none"
            placeholder="Type question in English..."
            value={q.textEn}
            onChange={(e) => update("textEn", e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
            نص السؤال (Arabic)
          </label>
          <textarea
            rows={3}
            className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none resize-none text-right"
            placeholder="اكتب السؤال بالعربية..."
            value={q.textAr}
            onChange={(e) => update("textAr", e.target.value)}
            dir="rtl"
          />
        </div>
      </div>

      {/* Why it matters */}
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
          Why This Question Matters (1 line)
        </label>
        <input
          className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none"
          placeholder="Strategic rationale for this question..."
          value={q.whyItMatters}
          onChange={(e) => update("whyItMatters", e.target.value)}
        />
      </div>

      {/* Options */}
      {showOptions && q.options && (
        <OptionEditor
          options={q.options}
          onChange={(opts) => update("options", opts)}
        />
      )}

      {/* Rating scale labels */}
      {showScale && (
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Min (EN)</label>
            <input className="w-full text-sm px-2 py-1.5 border border-slate-200 rounded" value={q.scaleMinLabelEn ?? ""} onChange={(e) => update("scaleMinLabelEn", e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Max (EN)</label>
            <input className="w-full text-sm px-2 py-1.5 border border-slate-200 rounded" value={q.scaleMaxLabelEn ?? ""} onChange={(e) => update("scaleMaxLabelEn", e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Min (AR)</label>
            <input className="w-full text-sm px-2 py-1.5 border border-slate-200 rounded text-right" dir="rtl" value={q.scaleMinLabelAr ?? ""} onChange={(e) => update("scaleMinLabelAr", e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Max (AR)</label>
            <input className="w-full text-sm px-2 py-1.5 border border-slate-200 rounded text-right" dir="rtl" value={q.scaleMaxLabelAr ?? ""} onChange={(e) => update("scaleMaxLabelAr", e.target.value)} />
          </div>
        </div>
      )}

      {/* Number range */}
      {showRange && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Min Value</label>
            <input type="number" className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg" value={q.minValue ?? ""} onChange={(e) => update("minValue", Number(e.target.value))} />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Max Value</label>
            <input type="number" className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg" value={q.maxValue ?? ""} onChange={(e) => update("maxValue", Number(e.target.value))} />
          </div>
        </div>
      )}

      {/* Role visibility */}
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">
          Visible To Roles
        </label>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => toggleRole(r)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                q.visibleToRoles.includes(r)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
              }`}
            >
              {ROLE_LABELS[r].en}
            </button>
          ))}
        </div>
      </div>

      {/* Sector visibility */}
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">
          Visible To Sectors
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => update("visibleToSectors", [...SECTORS])}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200"
          >
            All Sectors
          </button>
          {SECTORS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSector(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                q.visibleToSectors.includes(s)
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
              }`}
            >
              {SECTOR_LABELS[s].en}
            </button>
          ))}
        </div>
      </div>

      {/* Required */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-slate-700">Required question</label>
        <button
          type="button"
          onClick={() => update("required", !q.required)}
          className={`relative w-11 h-6 rounded-full transition-colors ${q.required ? "bg-blue-600" : "bg-slate-200"}`}
        >
          <span
            className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
              q.required ? "left-6" : "left-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}

// ─── Question Row ─────────────────────────────────────────────────────────────

function QuestionRow({
  question,
  index,
  onEdit,
  onDelete,
  onToggleStatus,
}: {
  question: SurveyQuestion;
  index: number;
  onEdit: (q: SurveyQuestion) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, status: QuestionStatus) => void;
}) {
  const blockLabel = BLOCK_LABELS[question.block].en;

  return (
    <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-start gap-4 hover:border-slate-300 transition-colors">
      {/* Drag handle */}
      <div className="drag-handle mt-1 text-slate-400 text-lg select-none">⋮⋮</div>

      {/* Order */}
      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-500 flex-shrink-0 mt-0.5">
        {index + 1}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2">
              {question.textEn || "(No English text)"}
            </p>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 text-right" dir="rtl">
              {question.textAr || "(No Arabic text)"}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <StatusBadge status={question.status} />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
            {blockLabel}
          </span>
          <span className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full">
            {TYPE_LABELS[question.type]}
          </span>
          <span className="text-xs text-slate-400">
            Roles: {question.visibleToRoles.map((r) => ROLE_LABELS[r].en).join(", ")}
          </span>
          <span className="text-xs text-slate-400">v{question.version}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onEdit(question)}
          className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          Edit
        </button>
        <select
          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 bg-white"
          value={question.status}
          onChange={(e) => onToggleStatus(question.id, e.target.value as QuestionStatus)}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <button
          onClick={() => onDelete(question.id)}
          className="px-2 py-1.5 text-xs text-slate-300 hover:text-red-400 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function QuestionBuilderPage() {
  const { questions, addQuestion, updateQuestion, deleteQuestion } =
    useAdminStore();
  const [editing, setEditing] = useState<SurveyQuestion | null>(null);
  const [filterBlock, setFilterBlock] = useState<SurveyBlock | "all">("all");
  const [filterStatus, setFilterStatus] = useState<QuestionStatus | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = questions
    .filter((q) => filterBlock === "all" || q.block === filterBlock)
    .filter((q) => filterStatus === "all" || q.status === filterStatus)
    .filter(
      (q) =>
        !search ||
        q.textEn.toLowerCase().includes(search.toLowerCase()) ||
        q.textAr.includes(search)
    )
    .sort((a, b) => a.order - b.order);

  const handleSave = (q: SurveyQuestion) => {
    const exists = questions.find((existing) => existing.id === q.id);
    if (exists) {
      updateQuestion(q.id, q);
    } else {
      addQuestion({ ...q, order: questions.length + 1 });
    }
    setEditing(null);
  };

  const handleToggleStatus = (id: string, status: QuestionStatus) => {
    updateQuestion(id, { status, ...(status === "published" ? { publishedAt: new Date().toISOString() } : {}) });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Question Builder</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {questions.length} questions across 5 blocks
          </p>
        </div>
        <button
          onClick={() => setEditing(blankQuestion())}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
          style={{ background: "linear-gradient(135deg, #0a1628, #1a3a6b)" }}
        >
          + New Question
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          className="flex-1 min-w-48 text-sm px-3 py-2 border border-slate-200 rounded-lg bg-white focus:border-blue-400 focus:outline-none"
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="text-sm px-3 py-2 border border-slate-200 rounded-lg bg-white focus:border-blue-400 focus:outline-none"
          value={filterBlock}
          onChange={(e) => setFilterBlock(e.target.value as SurveyBlock | "all")}
        >
          <option value="all">All Blocks</option>
          {BLOCKS.map((b) => (
            <option key={b} value={b}>{BLOCK_LABELS[b].en}</option>
          ))}
        </select>
        <select
          className="text-sm px-3 py-2 border border-slate-200 rounded-lg bg-white focus:border-blue-400 focus:outline-none"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as QuestionStatus | "all")}
        >
          <option value="all">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Edit form */}
      {editing && (
        <QuestionForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}

      {/* Question list */}
      <div className="space-y-3">
        {filtered.map((q, i) => (
          <QuestionRow
            key={q.id}
            question={q}
            index={i}
            onEdit={setEditing}
            onDelete={deleteQuestion}
            onToggleStatus={handleToggleStatus}
          />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400 text-sm">
            No questions match your filters.
          </div>
        )}
      </div>
    </div>
  );
}
