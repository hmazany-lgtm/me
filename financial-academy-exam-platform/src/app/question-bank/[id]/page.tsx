"use client";
import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { PageHeader, Card, CardHeader, Badge, StatusBadge, Button, InfoBanner, Restricted, Table, Th, Td } from "@/components/ui";
import { Meter } from "@/components/charts";
import { Watermark } from "@/components/Watermark";
import { Icon } from "@/components/Icon";
import { QUESTIONS } from "@/data/seed";
import { certName, titleCase, userName, shortDate } from "@/lib/format";
import { useSession } from "@/lib/session";
import { can, canViewAnswer } from "@/lib/permissions";
import { distractorAnalysis, itemFlags, itemRecommendation } from "@/lib/analytics";

export default function QuestionDetail({ params }: { params: { id: string } }) {
  const { user, logAccess } = useSession();
  const q = QUESTIONS.find((x) => x.id === params.id);
  const [answerRevealed, setAnswerRevealed] = useState(false);

  const mayView = can(user.roleKey, "view_question");
  const mayAnswer = q ? canViewAnswer(user.roleKey, q.authorId, user.id) : false;
  const mayExport = can(user.roleKey, "export_question");

  // Log the item view on mount (question-access log + audit).
  useEffect(() => {
    if (q && mayView) logAccess({ action: "question_viewed", object: q.id, risk: "medium" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q?.id]);

  // Discourage copy/print of secure content while this page is open.
  useEffect(() => {
    const block = (e: Event) => e.preventDefault();
    document.addEventListener("copy", block);
    document.addEventListener("contextmenu", block);
    return () => {
      document.removeEventListener("copy", block);
      document.removeEventListener("contextmenu", block);
    };
  }, []);

  if (!q) return notFound();

  if (!mayView) {
    return (
      <div>
        <PageHeader title={q.id} subtitle="Secure item" />
        <Restricted message="Your role cannot view question content. This access attempt has been recorded." />
      </div>
    );
  }

  const revealAnswer = () => {
    setAnswerRevealed(true);
    logAccess({ action: "answer_viewed", object: q.id, risk: "high" });
  };

  const distractors = distractorAnalysis(q);
  const flags = itemFlags(q);

  return (
    <Watermark>
      <div className="print-block no-select">
        <PageHeader
          title={<>{q.id}</> as any}
          subtitle={`${certName(q.certificationId)} · ${q.domain}`}
          actions={
            <>
              <Button variant="secondary" onClick={() => window.print()}><Icon name="report" className="w-4 h-4" />Print</Button>
              {mayExport
                ? <Button variant="secondary"><Icon name="lock" className="w-4 h-4" />Request export</Button>
                : <Button variant="secondary" disabled><Icon name="lock" className="w-4 h-4" />Export restricted</Button>}
            </>
          }
        />

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <StatusBadge status={q.status} />
          <Badge tone="blue">{titleCase(q.type)}</Badge>
          <Badge tone={q.difficulty === "hard" ? "red" : q.difficulty === "medium" ? "amber" : "green"}>{titleCase(q.difficulty)}</Badge>
          <Badge tone="purple">{titleCase(q.cognitiveLevel)}</Badge>
          <Badge tone="gold">{titleCase(q.securityClassification)}</Badge>
          <Badge tone="gray">v{q.version}</Badge>
        </div>

        <InfoBanner tone="amber">
          <span className="font-medium">Watermarked secure content.</span> Copy, right-click and (where supported) printing are disabled. This screen is tagged with your identity — {user.fullName} · {user.email}. Screenshots are traceable.
        </InfoBanner>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          <div className="lg:col-span-2 space-y-4">
            {/* Stem */}
            <Card>
              <CardHeader title="Question stem" subtitle="Fictional placeholder content — no real exam material" />
              <div className="p-5">
                <p className="text-navy-800 leading-relaxed">{q.stem}</p>
              </div>
            </Card>

            {/* Options + answer gating */}
            <Card>
              <CardHeader
                title="Answer options"
                subtitle={mayAnswer ? "You are authorized to reveal the key" : "Correct answer hidden for your role"}
                action={
                  mayAnswer ? (
                    !answerRevealed
                      ? <Button variant="secondary" onClick={revealAnswer}><Icon name="eye" className="w-4 h-4" />Reveal correct answer</Button>
                      : <Badge tone="red">Answer revealed · logged</Badge>
                  ) : <Badge tone="gray">Key masked</Badge>
                }
              />
              <div className="p-5 space-y-2">
                {q.options.map((o) => {
                  const showCorrect = answerRevealed && mayAnswer && o.isCorrect;
                  return (
                    <div key={o.label} className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${showCorrect ? "border-emerald-300 bg-emerald-50" : "border-navy-100"}`}>
                      <span className={`w-6 h-6 rounded-md grid place-items-center text-xs font-semibold ${showCorrect ? "bg-emerald-500 text-white" : "bg-navy-100 text-navy-600"}`}>{o.label}</span>
                      <span className="text-sm text-navy-700 flex-1">{o.text}</span>
                      {showCorrect && <Badge tone="green">Correct key</Badge>}
                    </div>
                  );
                })}
                {!mayAnswer && <p className="text-xs text-navy-400 mt-1">The correct answer is visible only to authorized reviewers, approvers and psychometric roles — never to authors of other items, invigilators, executives or candidates.</p>}
              </div>
            </Card>

            {/* Rationale */}
            <Card>
              <CardHeader title="Rationale & references" />
              <div className="p-5">
                {answerRevealed && mayAnswer ? (
                  <p className="text-sm text-navy-700 leading-relaxed mb-3">{q.explanation}</p>
                ) : (
                  <p className="text-sm text-navy-400 italic mb-3">Rationale hidden — reveal the answer key to view (authorized roles only).</p>
                )}
                <ul className="text-xs text-navy-500 space-y-1">
                  {q.references.map((r) => <li key={r} className="flex gap-2"><span className="text-teal-500">•</span>{r}</li>)}
                </ul>
              </div>
            </Card>

            {/* Distractor analysis */}
            <Card>
              <CardHeader title="Distractor analysis" subtitle="Response distribution & functioning (psychometric view)" />
              <Table>
                <thead><tr><Th>Option</Th><Th>Chosen %</Th><Th>Verdict</Th></tr></thead>
                <tbody>
                  {distractors.map((d) => (
                    <tr key={d.label}>
                      <Td className="font-medium">{d.label}{answerRevealed && mayAnswer && d.isCorrect && <Badge tone="green">key</Badge>}</Td>
                      <Td><div className="w-32"><Meter value={d.chosenPct} tone={d.isCorrect ? "green" : "navy"} label="" /></div></Td>
                      <Td className="text-xs text-navy-500">{d.verdict}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-navy-800 mb-3">Item statistics</h3>
              <dl className="space-y-2.5 text-sm">
                <Row label="Difficulty index (p)" value={q.difficultyIndex.toFixed(2)} />
                <Row label="Discrimination index" value={q.discriminationIndex.toFixed(2)} danger={q.discriminationIndex < 0.15} />
                <Row label="Point-biserial" value={q.pointBiserial.toFixed(2)} />
                <Row label="Usage count" value={`${q.usageCount} / ${q.exposureLimit}`} danger={q.usageCount > q.exposureLimit} />
                <Row label="Last used" value={q.lastUsedAt ? shortDate(q.lastUsedAt) : "Never"} />
                <Row label="Candidate flags" value={String(q.flagCount)} danger={q.flagCount >= 3} />
              </dl>
              <div className="mt-3 pt-3 border-t border-navy-100">
                <div className="flex flex-wrap gap-1.5">{flags.map((f) => <Badge key={f.label} tone={f.tone}>{f.label}</Badge>)}</div>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-semibold text-navy-800 mb-2">AI assistant recommendation</h3>
              <div className="rounded-lg bg-teal-50 border border-teal-100 p-3">
                <p className="text-xs text-teal-800"><span className="font-medium">Advisory:</span> {itemRecommendation(q)}</p>
                <p className="text-[10px] text-teal-600/70 mt-1.5">AI suggestion only — requires human decision. AI never approves items or changes keys.</p>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-semibold text-navy-800 mb-3">Governance</h3>
              <dl className="space-y-2.5 text-sm">
                <Row label="Author" value={userName(q.authorId)} />
                <Row label="Reviewer" value={q.reviewerId ? userName(q.reviewerId) : "—"} />
                <Row label="Approver" value={q.approverId ? userName(q.approverId) : "—"} />
                <Row label="Version" value={`v${q.version}`} />
              </dl>
              <p className="text-[11px] text-navy-400 mt-3 pt-3 border-t border-navy-100">SoD: the author cannot approve their own item. Older versions are archived and never delivered live.</p>
            </Card>

            {q.flagHistory.length > 0 && (
              <Card className="p-5">
                <h3 className="text-sm font-semibold text-navy-800 mb-3">Flag history</h3>
                <ul className="space-y-2">
                  {q.flagHistory.map((f, i) => (
                    <li key={i} className="text-xs text-navy-600 border-l-2 border-amber-300 pl-2.5">
                      <span className="font-medium">{f.reason}</span><span className="block text-navy-400">{f.date}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Watermark>
  );
}

function Row({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-navy-400">{label}</dt>
      <dd className={`font-medium tabular-nums ${danger ? "text-rose-600" : "text-navy-700"}`}>{value}</dd>
    </div>
  );
}
