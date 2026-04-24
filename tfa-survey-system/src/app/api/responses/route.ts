import { NextResponse } from "next/server";
import { SurveyResponse, RespondentRole, Sector } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

// In-memory store (replace with database in production)
let responses: SurveyResponse[] = [];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role") as RespondentRole | null;
  const sector = searchParams.get("sector") as Sector | null;
  const onlyComplete = searchParams.get("complete") === "true";
  const format = searchParams.get("format");
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "50", 10);

  let result = responses;
  if (role) result = result.filter((r) => r.respondentRole === role);
  if (sector) result = result.filter((r) => r.sector === sector);
  if (onlyComplete) result = result.filter((r) => r.isComplete);

  // CSV format
  if (format === "csv") {
    const headers = ["id", "role", "sector", "size", "lang", "complete", "confidence", "completedAt"];
    const rows = result.map((r) => [
      r.id, r.respondentRole, r.sector, r.companySize,
      r.language, r.isComplete, r.confidenceScore ?? "", r.completedAt ?? "",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    return new Response(csv, {
      headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="responses.csv"` },
    });
  }

  // Paginate
  const total = result.length;
  const paginated = result.slice((page - 1) * limit, page * limit);

  return NextResponse.json({
    responses: paginated,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validation
    if (!body.role || !body.sector) {
      return NextResponse.json({ error: "role and sector are required" }, { status: 400 });
    }

    // Range validation
    const answers = body.answers ?? {};
    for (const [key, val] of Object.entries(answers)) {
      if (typeof val === "number") {
        if (val < 0 || val > 1000) {
          return NextResponse.json(
            { error: `Value out of range for answer ${key}` },
            { status: 400 }
          );
        }
      }
    }

    // Consistency check: role must be valid
    const validRoles: RespondentRole[] = ["ld_hr", "finance", "business_leader", "regulator", "government", "vendor"];
    if (!validRoles.includes(body.role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const response: SurveyResponse = {
      id: uuidv4(),
      sessionId: body.sessionId ?? uuidv4(),
      respondentRole: body.role,
      sector: body.sector,
      companySize: body.companySize ?? "100_500",
      answers: Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        questionVersion: 1,
        value: value as string | string[] | number,
        answeredAt: new Date().toISOString(),
      })),
      startedAt: body.startedAt ?? new Date().toISOString(),
      completedAt: new Date().toISOString(),
      confidenceScore: body.confidenceScore ?? 1,
      isComplete: true,
      language: body.language ?? "en",
    };

    responses = [...responses, response];

    return NextResponse.json({ response, success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
