import { NextResponse } from "next/server";

// Analytics aggregation endpoint
// In production: queries database; here returns seeded mock data

export async function GET() {
  return NextResponse.json({
    summary: {
      totalResponses: 247,
      completeResponses: 198,
      completionRate: 0.80,
      avgConfidenceScore: 0.84,
      sectorsRepresented: 7,
      rolesRepresented: 6,
      lastUpdated: new Date().toISOString(),
    },

    byRole: [
      { role: "ld_hr", count: 96, pct: 38.9 },
      { role: "business_leader", count: 62, pct: 25.1 },
      { role: "finance", count: 48, pct: 19.4 },
      { role: "regulator", count: 21, pct: 8.5 },
      { role: "government", count: 12, pct: 4.9 },
      { role: "vendor", count: 8, pct: 3.2 },
    ],

    bySector: [
      { sector: "banking", count: 81, pct: 32.8 },
      { sector: "capital_markets", count: 52, pct: 21.1 },
      { sector: "insurance", count: 38, pct: 15.4 },
      { sector: "financing", count: 31, pct: 12.6 },
      { sector: "payments", count: 24, pct: 9.7 },
      { sector: "government", count: 14, pct: 5.7 },
      { sector: "training_provider", count: 7, pct: 2.8 },
    ],

    demandSignals: {
      level: {
        high_growing: 38,
        high_stable: 29,
        moderate: 21,
        low: 8,
        unclear: 4,
      },
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

    partnershipAppetite: {
      yes_eager: 24,
      yes_open: 39,
      maybe: 28,
      no: 9,
    },

    qualityGap: {
      avgSatisfactionScore: 2.9,
      scaledOf5: true,
      benchmarkTarget: 4.2,
    },
  });
}
