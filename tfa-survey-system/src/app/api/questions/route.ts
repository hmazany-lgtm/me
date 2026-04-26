export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { SurveyQuestion, QuestionOption, LogicRule, LogicCondition } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

// ─── Serialise DB row → app type ──────────────────────────────────────────────

function toAppQuestion(q: {
  id: string; block: string; order: number; type: string; status: string;
  textEn: string; textAr: string; hintEn: string | null; hintAr: string | null;
  whyItMatters: string; visibleToRoles: string; visibleToSectors: string;
  hiddenFromRoles: string | null; required: boolean; version: number;
  createdAt: Date; updatedAt: Date; publishedAt: Date | null; lastEditedBy: string | null;
  scaleMin: number | null; scaleMax: number | null;
  scaleMinLabelEn: string | null; scaleMaxLabelEn: string | null;
  scaleMinLabelAr: string | null; scaleMaxLabelAr: string | null;
  minValue: number | null; maxValue: number | null;
  options: { id: string; value: string; labelEn: string; labelAr: string; isOther: boolean }[];
  logicRules: {
    id: string; conditionLogic: string; action: string; targetQuestionId: string | null;
    conditions: { id: string; field: string; questionId: string | null; operator: string; value: string }[];
  }[];
}): SurveyQuestion {
  return {
    id: q.id,
    block: q.block as SurveyQuestion["block"],
    order: q.order,
    type: q.type as SurveyQuestion["type"],
    status: q.status as SurveyQuestion["status"],
    textEn: q.textEn,
    textAr: q.textAr,
    hintEn: q.hintEn ?? undefined,
    hintAr: q.hintAr ?? undefined,
    whyItMatters: q.whyItMatters,
    visibleToRoles: JSON.parse(q.visibleToRoles),
    visibleToSectors: JSON.parse(q.visibleToSectors),
    hiddenFromRoles: q.hiddenFromRoles ? JSON.parse(q.hiddenFromRoles) : undefined,
    required: q.required,
    version: q.version,
    createdAt: q.createdAt.toISOString(),
    updatedAt: q.updatedAt.toISOString(),
    publishedAt: q.publishedAt?.toISOString(),
    lastEditedBy: q.lastEditedBy ?? undefined,
    scaleMin: q.scaleMin ?? undefined,
    scaleMax: q.scaleMax ?? undefined,
    scaleMinLabelEn: q.scaleMinLabelEn ?? undefined,
    scaleMaxLabelEn: q.scaleMaxLabelEn ?? undefined,
    scaleMinLabelAr: q.scaleMinLabelAr ?? undefined,
    scaleMaxLabelAr: q.scaleMaxLabelAr ?? undefined,
    minValue: q.minValue ?? undefined,
    maxValue: q.maxValue ?? undefined,
    options: q.options.map((o) => ({
      id: o.id,
      value: o.value,
      labelEn: o.labelEn,
      labelAr: o.labelAr,
      isOther: o.isOther,
    })) as QuestionOption[],
    logicRules: q.logicRules.map((r) => ({
      id: r.id,
      conditions: r.conditions.map((c) => ({
        id: c.id,
        field: c.field as LogicCondition["field"],
        questionId: c.questionId ?? undefined,
        operator: c.operator as LogicCondition["operator"],
        value: JSON.parse(c.value),
      })),
      conditionLogic: r.conditionLogic as "AND" | "OR",
      action: r.action as LogicRule["action"],
      targetQuestionId: r.targetQuestionId ?? undefined,
    })),
  };
}

const INCLUDE = {
  options: true,
  logicRules: { include: { conditions: true } },
} as const;

// ─── GET /api/questions ───────────────────────────────────────────────────────

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? undefined;
  const block = searchParams.get("block") ?? undefined;

  const rows = await prisma.question.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(block ? { block } : {}),
    },
    orderBy: { order: "asc" },
    include: INCLUDE,
  });

  return NextResponse.json({ questions: rows.map(toAppQuestion), total: rows.length });
}

// ─── POST /api/questions ──────────────────────────────────────────────────────

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  if (user.role === "viewer") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body: SurveyQuestion = await request.json();

    const q = await prisma.question.create({
      data: {
        id: body.id ?? uuidv4(),
        block: body.block,
        order: body.order,
        type: body.type,
        status: body.status ?? "draft",
        textEn: body.textEn,
        textAr: body.textAr,
        hintEn: body.hintEn,
        hintAr: body.hintAr,
        whyItMatters: body.whyItMatters,
        visibleToRoles: JSON.stringify(body.visibleToRoles),
        visibleToSectors: JSON.stringify(body.visibleToSectors),
        hiddenFromRoles: body.hiddenFromRoles ? JSON.stringify(body.hiddenFromRoles) : null,
        required: body.required,
        version: 1,
        lastEditedBy: user.name,
        scaleMin: body.scaleMin,
        scaleMax: body.scaleMax,
        scaleMinLabelEn: body.scaleMinLabelEn,
        scaleMaxLabelEn: body.scaleMaxLabelEn,
        scaleMinLabelAr: body.scaleMinLabelAr,
        scaleMaxLabelAr: body.scaleMaxLabelAr,
        minValue: body.minValue,
        maxValue: body.maxValue,
        options: {
          create: (body.options ?? []).map((o) => ({
            id: o.id ?? uuidv4(),
            value: o.value,
            labelEn: o.labelEn,
            labelAr: o.labelAr,
            isOther: o.isOther ?? false,
          })),
        },
      },
      include: INCLUDE,
    });

    return NextResponse.json({ question: toAppQuestion(q) }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 });
  }
}

// ─── PUT /api/questions ───────────────────────────────────────────────────────

export async function PUT(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  if (user.role === "viewer") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body: SurveyQuestion = await request.json();

    // Delete and recreate options + logic rules (simplest safe approach)
    await prisma.questionOption.deleteMany({ where: { questionId: body.id } });
    await prisma.logicRule.deleteMany({ where: { questionId: body.id } });

    const q = await prisma.question.update({
      where: { id: body.id },
      data: {
        block: body.block,
        order: body.order,
        type: body.type,
        status: body.status,
        textEn: body.textEn,
        textAr: body.textAr,
        hintEn: body.hintEn,
        hintAr: body.hintAr,
        whyItMatters: body.whyItMatters,
        visibleToRoles: JSON.stringify(body.visibleToRoles),
        visibleToSectors: JSON.stringify(body.visibleToSectors),
        hiddenFromRoles: body.hiddenFromRoles ? JSON.stringify(body.hiddenFromRoles) : null,
        required: body.required,
        version: { increment: 1 },
        lastEditedBy: user.name,
        publishedAt: body.status === "published" ? new Date() : undefined,
        scaleMin: body.scaleMin,
        scaleMax: body.scaleMax,
        scaleMinLabelEn: body.scaleMinLabelEn,
        scaleMaxLabelEn: body.scaleMaxLabelEn,
        scaleMinLabelAr: body.scaleMinLabelAr,
        scaleMaxLabelAr: body.scaleMaxLabelAr,
        minValue: body.minValue,
        maxValue: body.maxValue,
        options: {
          create: (body.options ?? []).map((o) => ({
            id: o.id ?? uuidv4(),
            value: o.value,
            labelEn: o.labelEn,
            labelAr: o.labelAr,
            isOther: o.isOther ?? false,
          })),
        },
        logicRules: {
          create: (body.logicRules ?? []).map((r) => ({
            id: r.id ?? uuidv4(),
            conditionLogic: r.conditionLogic,
            action: r.action,
            targetQuestionId: r.targetQuestionId,
            conditions: {
              create: r.conditions.map((c) => ({
                id: c.id ?? uuidv4(),
                field: c.field,
                questionId: c.questionId,
                operator: c.operator,
                value: JSON.stringify(c.value),
              })),
            },
          })),
        },
      },
      include: INCLUDE,
    });

    return NextResponse.json({ question: toAppQuestion(q) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 });
  }
}

// ─── DELETE /api/questions?id= ────────────────────────────────────────────────

export async function DELETE(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  if (user.role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.question.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
