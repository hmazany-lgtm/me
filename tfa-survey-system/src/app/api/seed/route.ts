export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { INITIAL_QUESTIONS } from "@/data/questions";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

// POST /api/seed  — idempotent, safe to call multiple times
// Protected: only runs if no admin user exists yet (first-run guard)
export async function POST() {
  const existingAdmin = await prisma.adminUser.findFirst();

  // ── Seed admin user ────────────────────────────────────────────────────────
  let adminCreated = false;
  if (!existingAdmin) {
    const email = process.env.SEED_ADMIN_EMAIL ?? "admin@tfa.sa";
    const password = process.env.SEED_ADMIN_PASSWORD ?? "TFA@admin2025";
    const name = process.env.SEED_ADMIN_NAME ?? "TFA Super Admin";

    const hashed = await bcrypt.hash(password, 12);

    await prisma.adminUser.create({
      data: { id: uuidv4(), name, email, password: hashed, role: "super_admin" },
    });
    adminCreated = true;
  }

  // ── Seed questions (skip if already seeded) ────────────────────────────────
  const existingCount = await prisma.question.count();
  let questionsSeeded = 0;

  if (existingCount === 0) {
    for (const q of INITIAL_QUESTIONS) {
      await prisma.question.create({
        data: {
          id: q.id,
          block: q.block,
          order: q.order,
          type: q.type,
          status: q.status,
          textEn: q.textEn,
          textAr: q.textAr,
          hintEn: q.hintEn,
          hintAr: q.hintAr,
          whyItMatters: q.whyItMatters,
          visibleToRoles: JSON.stringify(q.visibleToRoles),
          visibleToSectors: JSON.stringify(q.visibleToSectors),
          hiddenFromRoles: q.hiddenFromRoles ? JSON.stringify(q.hiddenFromRoles) : null,
          required: q.required,
          version: q.version,
          scaleMin: q.scaleMin,
          scaleMax: q.scaleMax,
          scaleMinLabelEn: q.scaleMinLabelEn,
          scaleMaxLabelEn: q.scaleMaxLabelEn,
          scaleMinLabelAr: q.scaleMinLabelAr,
          scaleMaxLabelAr: q.scaleMaxLabelAr,
          minValue: q.minValue,
          maxValue: q.maxValue,
          options: {
            create: (q.options ?? []).map((o) => ({
              id: o.id,
              value: o.value,
              labelEn: o.labelEn,
              labelAr: o.labelAr,
              isOther: o.isOther ?? false,
            })),
          },
        },
      });
      questionsSeeded++;
    }
  }

  return NextResponse.json({
    success: true,
    adminCreated,
    questionsSeeded,
    adminEmail: process.env.SEED_ADMIN_EMAIL ?? "admin@tfa.sa",
  });
}

// GET — health check / seed status
export async function GET() {
  const [adminCount, questionCount, responseCount] = await Promise.all([
    prisma.adminUser.count(),
    prisma.question.count(),
    prisma.surveyResponse.count(),
  ]);

  return NextResponse.json({
    seeded: adminCount > 0 && questionCount > 0,
    adminUsers: adminCount,
    questions: questionCount,
    responses: responseCount,
  });
}
