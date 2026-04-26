export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { RespondentRole, Sector } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

// ─── GET /api/responses ───────────────────────────────────────────────────────

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role") ?? undefined;
  const sector = searchParams.get("sector") ?? undefined;
  const onlyComplete = searchParams.get("complete") === "true";
  const format = searchParams.get("format");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(200, parseInt(searchParams.get("limit") ?? "50", 10));

  const where = {
    ...(role ? { respondentRole: role } : {}),
    ...(sector ? { sector } : {}),
    ...(onlyComplete ? { isComplete: true } : {}),
  };

  const [total, responses] = await Promise.all([
    prisma.surveyResponse.count({ where }),
    prisma.surveyResponse.findMany({
      where,
      include: { answers: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  // CSV export
  if (format === "csv") {
    const headers = ["id", "role", "sector", "size", "lang", "complete", "confidence", "completedAt", "createdAt"];
    const rows = responses.map((r) => [
      r.id, r.respondentRole, r.sector, r.companySize,
      r.language, r.isComplete ? "TRUE" : "FALSE",
      r.confidenceScore ?? "",
      r.completedAt?.toISOString() ?? "",
      r.createdAt.toISOString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="tfa-responses.csv"`,
      },
    });
  }

  return NextResponse.json({
    responses,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  });
}

// ─── POST /api/responses ──────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.role || !body.sector) {
      return NextResponse.json({ error: "role and sector are required" }, { status: 400 });
    }

    const validRoles: RespondentRole[] = [
      "ld_hr", "finance", "business_leader", "regulator", "government", "vendor",
    ];
    const validSectors: Sector[] = [
      "banking", "insurance", "capital_markets", "financing",
      "payments", "government", "training_provider", "other",
    ];

    if (!validRoles.includes(body.role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    if (!validSectors.includes(body.sector)) {
      return NextResponse.json({ error: "Invalid sector" }, { status: 400 });
    }

    const answers: Record<string, unknown> = body.answers ?? {};

    // Range validation
    for (const [key, val] of Object.entries(answers)) {
      if (typeof val === "number" && (val < 0 || val > 10000)) {
        return NextResponse.json({ error: `Value out of range for ${key}` }, { status: 400 });
      }
    }

    const responseId = uuidv4();
    const now = new Date();

    const response = await prisma.surveyResponse.create({
      data: {
        id: responseId,
        sessionId: body.sessionId ?? uuidv4(),
        respondentRole: body.role,
        sector: body.sector,
        companySize: body.companySize ?? "100_500",
        startedAt: body.startedAt ? new Date(body.startedAt) : now,
        completedAt: now,
        confidenceScore: body.confidenceScore ?? 1,
        isComplete: true,
        language: body.language ?? "en",
        answers: {
          create: Object.entries(answers).map(([questionId, value]) => ({
            id: uuidv4(),
            questionId,
            questionVersion: 1,
            value: JSON.stringify(value),
            answeredAt: now,
          })),
        },
      },
      include: { answers: true },
    });

    return NextResponse.json({ response, success: true }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save response" }, { status: 500 });
  }
}
