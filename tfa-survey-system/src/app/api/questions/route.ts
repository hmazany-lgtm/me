import { NextResponse } from "next/server";
import { INITIAL_QUESTIONS } from "@/data/questions";
import { SurveyQuestion } from "@/lib/types";

// In-memory store (replace with DB in production)
let questions: SurveyQuestion[] = [...INITIAL_QUESTIONS];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const block = searchParams.get("block");

  let result = questions;
  if (status) result = result.filter((q) => q.status === status);
  if (block) result = result.filter((q) => q.block === block);

  return NextResponse.json({
    questions: result.sort((a, b) => a.order - b.order),
    total: result.length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newQuestion: SurveyQuestion = {
      ...body,
      id: body.id ?? `q${Date.now()}`,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    questions = [...questions, newQuestion];
    return NextResponse.json({ question: newQuestion }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    questions = questions.map((q) =>
      q.id === id
        ? { ...q, ...updates, version: q.version + 1, updatedAt: new Date().toISOString() }
        : q
    );
    const updated = questions.find((q) => q.id === id);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ question: updated });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  questions = questions.filter((q) => q.id !== id);
  return NextResponse.json({ success: true });
}
