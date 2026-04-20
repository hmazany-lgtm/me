import { NextResponse } from "next/server";
import { centers, programs, alerts, targets } from "@/lib/mockData";

type AgentResult = {
  agentId: string;
  agentName: string;
  status: "completed" | "running" | "idle";
  lastRun: string;
  findings: Finding[];
  summary: string;
};

type Finding = {
  id: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  detail: string;
  centerId?: string;
  centerName?: string;
  recommendation: string;
};

function runPerformanceAgent(): AgentResult {
  const findings: Finding[] = [];

  centers.forEach((center) => {
    if (center.score < 60) {
      findings.push({
        id: `perf-${center.id}-critical`,
        severity: "critical",
        title: `${center.name} — Critical Performance Score`,
        detail: `Overall score of ${center.score}/100 is below acceptable threshold. Completion rate at ${center.completionRate}%.`,
        centerId: center.id,
        centerName: center.name,
        recommendation: "Schedule immediate intervention session with center management and assign a performance coach.",
      });
    } else if (center.score < 70) {
      findings.push({
        id: `perf-${center.id}-warning`,
        severity: "high",
        title: `${center.name} — Below Target Performance`,
        detail: `Score of ${center.score}/100 requires attention. Satisfaction at ${center.satisfactionScore}/5.`,
        centerId: center.id,
        centerName: center.name,
        recommendation: "Review curriculum delivery and instructor effectiveness. Set 30-day improvement plan.",
      });
    }

    const atRiskTargets = targets.filter(
      (t) => t.centerId === center.id && (t.status === "at_risk" || t.status === "missed")
    );
    if (atRiskTargets.length > 0) {
      findings.push({
        id: `perf-target-${center.id}`,
        severity: atRiskTargets.some((t) => t.status === "missed") ? "high" : "medium",
        title: `${center.name} — ${atRiskTargets.length} Target(s) At Risk`,
        detail: atRiskTargets.map((t) => `${t.metric}: ${t.current}${t.unit} vs target ${t.target}${t.unit}`).join("; "),
        centerId: center.id,
        centerName: center.name,
        recommendation: "Allocate additional resources and re-baseline Q2 targets with corrective action plan.",
      });
    }
  });

  return {
    agentId: "performance-agent",
    agentName: "Performance Agent",
    status: "completed",
    lastRun: new Date().toISOString(),
    findings,
    summary: `Analyzed ${centers.length} centers. Found ${findings.filter((f) => f.severity === "critical").length} critical, ${findings.filter((f) => f.severity === "high").length} high-severity issues.`,
  };
}

function runSlowdownAgent(): AgentResult {
  const findings: Finding[] = [];

  centers.forEach((center) => {
    const data = center.monthlyData;
    if (data.length >= 3) {
      const recent = data.slice(-3);
      const declining = recent.every((d, i) => i === 0 || d.score <= recent[i - 1].score);
      const totalDrop = recent[0].score - recent[recent.length - 1].score;

      if (declining && totalDrop >= 5) {
        findings.push({
          id: `slow-${center.id}-decline`,
          severity: totalDrop >= 10 ? "critical" : "high",
          title: `${center.name} — Sustained Performance Decline`,
          detail: `Score dropped from ${recent[0].score} to ${recent[recent.length - 1].score} over 3 months (−${totalDrop} points).`,
          centerId: center.id,
          centerName: center.name,
          recommendation: "Conduct root cause analysis. Evaluate instructor turnover, curriculum relevance, and trainee feedback patterns.",
        });
      }

      const traineeDrop = recent[0].trainees - recent[recent.length - 1].trainees;
      if (traineeDrop > 50) {
        findings.push({
          id: `slow-${center.id}-dropout`,
          severity: traineeDrop > 100 ? "high" : "medium",
          title: `${center.name} — Trainee Dropout Acceleration`,
          detail: `Trainee count dropped by ${traineeDrop} in last 3 months (${recent[0].trainees} → ${recent[recent.length - 1].trainees}).`,
          centerId: center.id,
          centerName: center.name,
          recommendation: "Deploy exit-survey analysis and offer targeted retention incentives or program adjustments.",
        });
      }
    }
  });

  const pausedPrograms = programs.filter((p) => p.status === "paused");
  pausedPrograms.forEach((prog) => {
    findings.push({
      id: `slow-prog-${prog.id}`,
      severity: "high",
      title: `Program Paused: ${prog.name}`,
      detail: `${prog.enrolledCount} trainees affected. Budget utilization: ${Math.round((prog.spent / prog.budget) * 100)}%.`,
      centerId: prog.centerId,
      centerName: prog.centerName,
      recommendation: "Resolve blocking issue and create resumption plan within 2 weeks. Communicate timeline to enrolled trainees.",
    });
  });

  return {
    agentId: "slowdown-agent",
    agentName: "Slowdown Detection Agent",
    status: "completed",
    lastRun: new Date().toISOString(),
    findings,
    summary: `Scanned trend data across ${centers.length} centers and ${programs.length} programs. Detected ${findings.length} slowdown signals.`,
  };
}

function runInnovationAgent(): AgentResult {
  const findings: Finding[] = [];

  const topCenters = centers.filter((c) => c.score >= 85);
  topCenters.forEach((center) => {
    findings.push({
      id: `innov-replicate-${center.id}`,
      severity: "low",
      title: `Replicate Best Practices from ${center.name}`,
      detail: `Score: ${center.score}/100, Satisfaction: ${center.satisfactionScore}/5, Completion: ${center.completionRate}%. This center leads the network.`,
      centerId: center.id,
      centerName: center.name,
      recommendation: "Document and package top-performing methodologies as a replication kit for underperforming centers.",
    });
  });

  findings.push({
    id: "innov-vr-training",
    severity: "low",
    title: "Emerging Tech: VR/AR Simulation Training",
    detail: "Industry data shows 25-35% improvement in practical skill retention with immersive training environments.",
    recommendation: "Pilot VR simulation in 1 technical program at Riyadh or Jeddah center. Budget est. SAR 150K.",
  });

  findings.push({
    id: "innov-ai-assessment",
    severity: "low",
    title: "AI-Powered Adaptive Assessment",
    detail: "Personalized assessment paths reduce test anxiety and improve pass rates by up to 20% in comparable institutions.",
    recommendation: "Integrate adaptive assessment engine into 3 high-enrollment programs in Q3.",
  });

  findings.push({
    id: "innov-gamification",
    severity: "low",
    title: "Gamification & Micro-credentialing",
    detail: "Badge-based progression systems show 30% increase in voluntary re-enrollment.",
    recommendation: "Launch a micro-credential framework across all centers starting with soft skills programs.",
  });

  const lowSatisfactionCenters = centers.filter((c) => c.satisfactionScore < 4.0);
  lowSatisfactionCenters.forEach((center) => {
    findings.push({
      id: `innov-satisfaction-${center.id}`,
      severity: "medium",
      title: `${center.name} — Redesign Trainee Experience`,
      detail: `Satisfaction at ${center.satisfactionScore}/5 suggests structural UX/CX issues in program delivery.`,
      centerId: center.id,
      centerName: center.name,
      recommendation: "Commission design thinking workshop with trainees and instructors to reimagine learning experience.",
    });
  });

  return {
    agentId: "innovation-agent",
    agentName: "Innovation Suggestion Agent",
    status: "completed",
    lastRun: new Date().toISOString(),
    findings,
    summary: `Generated ${findings.length} innovation insights. ${topCenters.length} centers identified as best-practice sources. 3 technology adoption opportunities flagged.`,
  };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const agentId = body.agentId as string | undefined;

  const runners: Record<string, () => AgentResult> = {
    "performance-agent": runPerformanceAgent,
    "slowdown-agent": runSlowdownAgent,
    "innovation-agent": runInnovationAgent,
  };

  if (agentId && runners[agentId]) {
    return NextResponse.json(runners[agentId]());
  }

  const results = Object.values(runners).map((fn) => fn());
  return NextResponse.json({ agents: results });
}

export async function GET() {
  const results = [runPerformanceAgent(), runSlowdownAgent(), runInnovationAgent()];
  return NextResponse.json({ agents: results });
}
