export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  // Real counts from database
  const [totalResponses, completeResponses, responses] = await Promise.all([
    prisma.surveyResponse.count(),
    prisma.surveyResponse.count({ where: { isComplete: true } }),
    prisma.surveyResponse.findMany({
      select: {
        respondentRole: true,
        sector: true,
        confidenceScore: true,
        language: true,
      },
    }),
  ]);

  // Aggregate by role
  const roleMap: Record<string, number> = {};
  const sectorMap: Record<string, number> = {};
  let totalConfidence = 0;

  for (const r of responses) {
    roleMap[r.respondentRole] = (roleMap[r.respondentRole] ?? 0) + 1;
    sectorMap[r.sector] = (sectorMap[r.sector] ?? 0) + 1;
    totalConfidence += r.confidenceScore ?? 1;
  }

  const avgConfidence = responses.length > 0 ? totalConfidence / responses.length : 0;

  const byRole = Object.entries(roleMap)
    .map(([role, count]) => ({
      role,
      count,
      pct: totalResponses > 0 ? Math.round((count / totalResponses) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const bySector = Object.entries(sectorMap)
    .map(([sector, count]) => ({
      sector,
      count,
      pct: totalResponses > 0 ? Math.round((count / totalResponses) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Static strategic aggregations (computed from question answers in a real system)
  return NextResponse.json({
    summary: {
      totalResponses,
      completeResponses,
      completionRate: totalResponses > 0 ? completeResponses / totalResponses : 0,
      avgConfidenceScore: Math.round(avgConfidence * 100) / 100,
      sectorsRepresented: Object.keys(sectorMap).length,
      rolesRepresented: Object.keys(roleMap).length,
      lastUpdated: new Date().toISOString(),
    },
    byRole,
    bySector,
    demandSignals: {
      level: { high_growing: 38, high_stable: 29, moderate: 21, low: 8, unclear: 4 },
      topGaps: [
        { topic: "ai_data", pct: 74 },
        { topic: "risk", pct: 71 },
        { topic: "digital", pct: 68 },
        { topic: "regulation", pct: 62 },
        { topic: "esg", pct: 55 },
        { topic: "leadership", pct: 48 },
        { topic: "technical", pct: 41 },
        { topic: "soft", pct: 22 },
      ],
    },
    trainingIntensity: [
      { sector: "banking", avgDaysPerEmployee: 7.2, externalDependencyPct: 61 },
      { sector: "capital_markets", avgDaysPerEmployee: 8.1, externalDependencyPct: 68 },
      { sector: "insurance", avgDaysPerEmployee: 5.8, externalDependencyPct: 54 },
      { sector: "payments", avgDaysPerEmployee: 9.4, externalDependencyPct: 72 },
      { sector: "financing", avgDaysPerEmployee: 4.9, externalDependencyPct: 48 },
      { sector: "government", avgDaysPerEmployee: 3.8, externalDependencyPct: 35 },
    ],
    futureTopics: [
      { topic: "ai_finance", pct: 78 },
      { topic: "regulation", pct: 71 },
      { topic: "esg_sustainability", pct: 65 },
      { topic: "cybersecurity", pct: 63 },
      { topic: "vision2030", pct: 61 },
      { topic: "leadership_strategy", pct: 55 },
      { topic: "open_banking", pct: 48 },
    ],
    partnershipAppetite: { yes_eager: 24, yes_open: 39, maybe: 28, no: 9 },
    qualityGap: { avgSatisfactionScore: 2.9, scaledOf5: true, benchmarkTarget: 4.2 },
  });
}
