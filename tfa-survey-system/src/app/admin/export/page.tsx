"use client";

import { useState } from "react";
import { useAdminStore } from "@/lib/store";
import { INITIAL_QUESTIONS } from "@/data/questions";

type ExportFormat = "excel" | "csv" | "json" | "powerbi";

const FORMAT_INFO: Record<ExportFormat, { label: string; icon: string; desc: string; ext: string; mime: string }> = {
  excel: {
    label: "Excel (.xlsx)",
    icon: "📊",
    desc: "Full dataset with multiple sheets: Responses, Questions, Analytics",
    ext: "xlsx",
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  },
  csv: {
    label: "CSV",
    icon: "📄",
    desc: "Flat file, one row per response, compatible with any tool",
    ext: "csv",
    mime: "text/csv",
  },
  json: {
    label: "JSON",
    icon: "{ }",
    desc: "Full structured data including questions, options, and logic rules",
    ext: "json",
    mime: "application/json",
  },
  powerbi: {
    label: "Power BI Ready",
    icon: "📈",
    desc: "Pre-formatted CSV with date fields, numeric codes, and normalized structure",
    ext: "csv",
    mime: "text/csv",
  },
};

function buildCSV(questions: typeof INITIAL_QUESTIONS): string {
  const headers = [
    "Response ID",
    "Submitted At",
    "Role",
    "Sector",
    "Company Size",
    "Language",
    "Confidence Score",
    "Is Complete",
    ...questions.map((q) => `Q${q.order}: ${q.textEn.substring(0, 40)}`),
  ];

  // Mock rows
  const rows = Array.from({ length: 15 }, (_, i) => [
    `resp_${(i + 1).toString().padStart(4, "0")}`,
    new Date(Date.now() - i * 86400000).toISOString(),
    ["ld_hr", "finance", "business_leader", "regulator"][i % 4],
    ["banking", "insurance", "capital_markets", "payments"][i % 4],
    ["under_100", "100_500", "500_2000", "over_2000"][i % 4],
    i % 3 === 0 ? "ar" : "en",
    (0.7 + Math.random() * 0.3).toFixed(2),
    i < 12 ? "TRUE" : "FALSE",
    ...questions.map(() => ""),
  ]);

  return [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
}

function buildJSON(questions: typeof INITIAL_QUESTIONS): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      version: "1.0",
      questions: questions.map((q) => ({
        id: q.id,
        block: q.block,
        order: q.order,
        type: q.type,
        status: q.status,
        textEn: q.textEn,
        textAr: q.textAr,
        options: q.options,
        visibleToRoles: q.visibleToRoles,
        visibleToSectors: q.visibleToSectors,
        version: q.version,
      })),
      responses: {
        total: 247,
        complete: 198,
        note: "Full response data available via API endpoint /api/responses",
      },
    },
    null,
    2
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function buildPowerBICSV(_q: typeof INITIAL_QUESTIONS): string {
  const headers = [
    "response_id",
    "submitted_date",
    "submitted_year",
    "submitted_month",
    "role_code",
    "role_label",
    "sector_code",
    "sector_label",
    "company_size_code",
    "is_complete",
    "confidence_score",
    "language_code",
  ];

  const roleMap: Record<string, number> = { ld_hr: 1, finance: 2, business_leader: 3, regulator: 4, government: 5, vendor: 6 };
  const sectorMap: Record<string, number> = { banking: 1, insurance: 2, capital_markets: 3, financing: 4, payments: 5, government: 6, training_provider: 7, other: 8 };

  const rows = Array.from({ length: 20 }, (_, i) => {
    const role = ["ld_hr", "finance", "business_leader", "regulator"][i % 4];
    const sector = ["banking", "insurance", "capital_markets", "payments"][i % 4];
    const date = new Date(Date.now() - i * 86400000);
    return [
      `resp_${(i + 1).toString().padStart(4, "0")}`,
      date.toISOString().split("T")[0],
      date.getFullYear(),
      date.getMonth() + 1,
      roleMap[role],
      role,
      sectorMap[sector],
      sector,
      [1, 2, 3, 4][i % 4],
      i < 16 ? 1 : 0,
      (0.7 + Math.random() * 0.3).toFixed(2),
      i % 3 === 0 ? "ar" : "en",
    ];
  });

  return [headers, ...rows].map((r) => r.join(",")).join("\n");
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ExportCenterPage() {
  const { questions } = useAdminStore();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("csv");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [onlyComplete, setOnlyComplete] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [lastExport, setLastExport] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    await new Promise((r) => setTimeout(r, 800));

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split("T")[0];
    const filename = `tfa-survey-${timestamp}.${FORMAT_INFO[selectedFormat].ext}`;

    let content = "";
    if (selectedFormat === "csv" || selectedFormat === "excel") {
      content = buildCSV(questions);
    } else if (selectedFormat === "json") {
      content = buildJSON(questions);
    } else if (selectedFormat === "powerbi") {
      content = buildPowerBICSV(questions);
    }

    downloadFile(content, filename, FORMAT_INFO[selectedFormat].mime);
    setLastExport(new Date().toLocaleString());
    setIsExporting(false);
  };

  const exportQuestionSchema = () => {
    const schema = {
      $schema: "http://json-schema.org/draft-07/schema#",
      title: "TFA Survey Response",
      type: "object",
      properties: {
        id: { type: "string" },
        sessionId: { type: "string" },
        respondentRole: { type: "string", enum: ["ld_hr", "finance", "business_leader", "regulator", "government", "vendor"] },
        sector: { type: "string" },
        companySize: { type: "string" },
        answers: {
          type: "object",
          additionalProperties: {
            oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }, { type: "number" }],
          },
        },
        startedAt: { type: "string", format: "date-time" },
        completedAt: { type: "string", format: "date-time" },
        confidenceScore: { type: "number", minimum: 0, maximum: 1 },
        isComplete: { type: "boolean" },
        language: { type: "string", enum: ["en", "ar"] },
      },
    };

    downloadFile(JSON.stringify(schema, null, 2), "tfa-response-schema.json", "application/json");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Export Center</h1>
        <p className="text-slate-500 text-sm mt-0.5">Export survey data in multiple formats</p>
      </div>

      {/* Format Selection */}
      <div className="grid grid-cols-2 gap-3">
        {(Object.entries(FORMAT_INFO) as [ExportFormat, typeof FORMAT_INFO[ExportFormat]][]).map(
          ([fmt, info]) => (
            <button
              key={fmt}
              type="button"
              onClick={() => setSelectedFormat(fmt)}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                selectedFormat === fmt
                  ? "border-blue-600 bg-blue-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="text-2xl mb-2">{info.icon}</div>
              <div className="font-semibold text-sm text-slate-800">{info.label}</div>
              <div className="text-xs text-slate-500 mt-1">{info.desc}</div>
            </button>
          )
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h3 className="font-semibold text-slate-700 text-sm">Export Filters</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Date From</label>
            <input
              type="date"
              className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Date To</label>
            <input
              type="date"
              className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOnlyComplete(!onlyComplete)}
            className={`relative w-11 h-6 rounded-full transition-colors ${onlyComplete ? "bg-blue-600" : "bg-slate-200"}`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                onlyComplete ? "left-6" : "left-1"
              }`}
            />
          </button>
          <label className="text-sm text-slate-700">Only complete responses</label>
        </div>
      </div>

      {/* Export summary */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-sm text-slate-600">
        <div className="flex items-center justify-between">
          <span>Estimated export size:</span>
          <span className="font-semibold">
            {onlyComplete ? "198" : "247"} responses × {questions.length} questions
          </span>
        </div>
      </div>

      {/* Export button */}
      <button
        type="button"
        onClick={handleExport}
        disabled={isExporting}
        className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-60"
        style={{ background: "linear-gradient(135deg, #0a1628, #1a3a6b)" }}
      >
        {isExporting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block"></span>
            Preparing export...
          </span>
        ) : (
          `Export as ${FORMAT_INFO[selectedFormat].label} ⤓`
        )}
      </button>

      {lastExport && (
        <p className="text-xs text-slate-400 text-center">Last exported: {lastExport}</p>
      )}

      {/* Schema export */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-700 text-sm">JSON Schema</h3>
            <p className="text-xs text-slate-400 mt-0.5">Download the data model schema for integration</p>
          </div>
          <button
            onClick={exportQuestionSchema}
            className="px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
          >
            Download Schema
          </button>
        </div>
      </div>

      {/* API endpoint info */}
      <div className="bg-slate-900 rounded-2xl p-5 text-sm">
        <h3 className="text-slate-300 font-semibold mb-3">API Endpoints</h3>
        <div className="space-y-2 font-mono text-xs">
          {[
            { method: "GET", path: "/api/responses", desc: "All responses (paginated)" },
            { method: "GET", path: "/api/responses?format=csv", desc: "Direct CSV stream" },
            { method: "GET", path: "/api/questions", desc: "Current question bank" },
            { method: "GET", path: "/api/analytics", desc: "Aggregated analytics" },
            { method: "POST", path: "/api/responses", desc: "Submit new response" },
          ].map((ep) => (
            <div key={ep.path} className="flex items-center gap-3">
              <span
                className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                  ep.method === "GET" ? "bg-green-900 text-green-300" : "bg-blue-900 text-blue-300"
                }`}
              >
                {ep.method}
              </span>
              <span className="text-slate-300">{ep.path}</span>
              <span className="text-slate-500">{ep.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
