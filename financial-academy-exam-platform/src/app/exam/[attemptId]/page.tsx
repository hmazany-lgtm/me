"use client";
import { useState, useEffect, useRef } from "react";
import { Watermark } from "@/components/Watermark";
import { Icon } from "@/components/Icon";
import { useSession } from "@/lib/session";

type Phase = "identity" | "instructions" | "exam" | "expired" | "done";

const EXAM_MINUTES = 90;
const QUESTIONS = Array.from({ length: 10 }, (_, i) => ({
  n: i + 1,
  stem: `Sample secure question ${i + 1} — content shown only during your active exam session. This placeholder stem stands in for a live, security-classified exam item.`,
  options: ["A", "B", "C", "D"].map((label) => ({
    label,
    text: `Answer option ${label} — placeholder response for demonstration only.`,
  })),
}));

export default function ExamInterface({ params }: { params: { attemptId: string } }) {
  const { user, logAccess } = useSession();
  const [phase, setPhase] = useState<Phase>("identity");

  // identity + rules
  const [nationalId, setNationalId] = useState("");
  const [agreed, setAgreed] = useState(false);

  // exam state
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(EXAM_MINUTES * 60);
  const [saveState, setSaveState] = useState<"saved" | "saving">("saved");
  const [showConfirm, setShowConfirm] = useState(false);
  const startedRef = useRef(false);

  // Countdown — runs only during the live exam; auto-locks at zero.
  useEffect(() => {
    if (phase !== "exam") return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          setPhase("expired");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  // Auto-save indicator — pulses every few seconds while sitting the exam.
  useEffect(() => {
    if (phase !== "exam") return;
    const id = setInterval(() => {
      setSaveState("saving");
      const t = setTimeout(() => setSaveState("saved"), 700);
      return () => clearTimeout(t);
    }, 4000);
    return () => clearInterval(id);
  }, [phase]);

  const enterExam = () => {
    setPhase("exam");
    if (!startedRef.current) {
      startedRef.current = true;
      logAccess({ action: "exam_started", object: params.attemptId, risk: "medium" });
    }
  };

  const submitExam = () => {
    logAccess({ action: "exam_submitted", object: params.attemptId, risk: "medium" });
    setShowConfirm(false);
    setPhase("done");
  };

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");
  const answeredCount = Object.keys(answers).length;
  const lowTime = timeLeft <= 5 * 60;

  return (
    <Watermark>
      <div className="min-h-screen bg-navy-50 no-select">
        {/* ------- Phase 1: Identity verification ------- */}
        {phase === "identity" && (
          <Centered>
            <StepDots active={1} />
            <h1 className="text-xl font-semibold text-navy-900 text-center">Identity verification</h1>
            <p className="text-sm text-navy-500 text-center mt-1 mb-6">Confirm your identity before the exam unlocks. This step is supervised and recorded.</p>
            <div className="flex flex-col items-center gap-4">
              <div className="w-32 h-32 rounded-xl bg-navy-100 border border-navy-200 grid place-items-center text-navy-400">
                <Icon name="id" className="w-12 h-12" />
              </div>
              <p className="text-[11px] text-navy-400">Live photo capture (placeholder)</p>
              <div className="w-full">
                <label className="block text-xs font-medium text-navy-600 mb-1">National ID</label>
                <input
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ""))}
                  placeholder="10-digit National ID"
                  maxLength={10}
                  className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                />
              </div>
            </div>
            <button
              onClick={() => setPhase("instructions")}
              disabled={nationalId.length < 10}
              className="w-full mt-6 rounded-lg bg-navy-800 text-white py-2.5 text-sm font-medium hover:bg-navy-700 disabled:opacity-40"
            >
              Verify identity
            </button>
          </Centered>
        )}

        {/* ------- Phase 2: Instructions + NDA ------- */}
        {phase === "instructions" && (
          <Centered wide>
            <StepDots active={2} />
            <h1 className="text-xl font-semibold text-navy-900 text-center">Exam rules & candidate agreement</h1>
            <p className="text-sm text-navy-500 text-center mt-1 mb-5">Read carefully. Proceeding constitutes acceptance of the exam integrity agreement.</p>
            <ul className="space-y-2.5 text-sm text-navy-700">
              {[
                "This is a single-session, time-limited exam. Once started, the clock cannot be paused.",
                "Question order and answer options may be randomized for each candidate.",
                "You may flag questions for review and navigate between them until you submit.",
                "After submission, responses are locked. You cannot return to the exam.",
                "No exam content may be copied, photographed, or shared. All activity is logged and watermarked to your identity.",
                "Correct answers and scoring keys are never displayed to candidates.",
              ].map((r) => (
                <li key={r} className="flex gap-2.5">
                  <span className="text-teal-500 mt-0.5"><Icon name="check" className="w-4 h-4" /></span>{r}
                </li>
              ))}
            </ul>
            <label className="flex items-start gap-2.5 mt-6 rounded-lg bg-navy-50 border border-navy-100 p-3 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 accent-teal-600" />
              <span className="text-xs text-navy-600">I acknowledge the non-disclosure agreement and exam rules, and confirm I am {user.fullName} sitting this exam unaided.</span>
            </label>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setPhase("identity")} className="rounded-lg px-4 py-2.5 text-sm font-medium text-navy-600 hover:bg-navy-100">Back</button>
              <button onClick={enterExam} disabled={!agreed} className="flex-1 rounded-lg bg-navy-800 text-white py-2.5 text-sm font-medium hover:bg-navy-700 disabled:opacity-40">
                Start exam
              </button>
            </div>
          </Centered>
        )}

        {/* ------- Phase 3: The exam ------- */}
        {phase === "exam" && (
          <div className="flex flex-col min-h-screen">
            {/* Top bar */}
            <div className="sticky top-0 z-10 bg-white border-b border-navy-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-navy-800">
                <Icon name="shield" className="w-5 h-5 text-teal-600" />Secure Exam
              </div>
              <div className="flex items-center gap-4">
                <span className={`inline-flex items-center gap-1.5 text-xs ${saveState === "saving" ? "text-navy-400" : "text-emerald-600"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${saveState === "saving" ? "bg-navy-300 animate-pulse" : "bg-emerald-500"}`} />
                  {saveState === "saving" ? "Saving…" : "Answer saved"}
                </span>
                <span className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold tabular-nums ${lowTime ? "bg-rose-600 text-white animate-pulse" : "bg-navy-800 text-white"}`}>
                  <Icon name="clock" className="w-4 h-4" />{mm}:{ss}
                </span>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-4 p-4 sm:p-6 max-w-6xl w-full mx-auto">
              {/* Current question */}
              <div className="bg-white rounded-xl border border-navy-100 p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-medium text-navy-400 uppercase tracking-wide">Question {current + 1} of {QUESTIONS.length}</p>
                  <button
                    onClick={() => setFlagged((f) => ({ ...f, [current]: !f[current] }))}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium ${flagged[current] ? "bg-amber-100 text-amber-700" : "text-navy-500 hover:bg-navy-100"}`}
                  >
                    <Icon name="alert" className="w-3.5 h-3.5" />{flagged[current] ? "Flagged for review" : "Flag for review"}
                  </button>
                </div>
                <p className="text-navy-800 leading-relaxed mb-5">{QUESTIONS[current].stem}</p>
                <p className="text-[10px] text-navy-300 mb-3">Option order may be randomized for each candidate.</p>
                <div className="space-y-2">
                  {QUESTIONS[current].options.map((o) => {
                    const selected = answers[current] === o.label;
                    return (
                      <label key={o.label} className={`flex items-center gap-3 rounded-lg border px-3 py-3 cursor-pointer transition ${selected ? "border-teal-400 bg-teal-50" : "border-navy-100 hover:bg-navy-50"}`}>
                        <input
                          type="radio"
                          name={`q-${current}`}
                          checked={selected}
                          onChange={() => { setAnswers((a) => ({ ...a, [current]: o.label })); setSaveState("saving"); setTimeout(() => setSaveState("saved"), 500); }}
                          className="accent-teal-600"
                        />
                        <span className={`w-6 h-6 rounded-md grid place-items-center text-xs font-semibold ${selected ? "bg-teal-500 text-white" : "bg-navy-100 text-navy-600"}`}>{o.label}</span>
                        <span className="text-sm text-navy-700">{o.text}</span>
                      </label>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-navy-100">
                  <button onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0} className="rounded-lg px-4 py-2 text-sm font-medium text-navy-600 hover:bg-navy-100 disabled:opacity-40">Previous</button>
                  {current < QUESTIONS.length - 1 ? (
                    <button onClick={() => setCurrent((c) => Math.min(QUESTIONS.length - 1, c + 1))} className="rounded-lg bg-navy-800 text-white px-5 py-2 text-sm font-medium hover:bg-navy-700">Next</button>
                  ) : (
                    <button onClick={() => setShowConfirm(true)} className="rounded-lg bg-teal-600 text-white px-5 py-2 text-sm font-medium hover:bg-teal-500">Submit exam</button>
                  )}
                </div>
              </div>

              {/* Navigator */}
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-navy-100 p-4">
                  <p className="text-xs font-semibold text-navy-700 mb-3">Question navigator</p>
                  <div className="grid grid-cols-5 gap-1.5">
                    {QUESTIONS.map((q, i) => {
                      const isCur = i === current;
                      const isAns = answers[i] !== undefined;
                      const isFlag = flagged[i];
                      return (
                        <button
                          key={q.n}
                          onClick={() => setCurrent(i)}
                          className={`relative h-8 rounded-md text-xs font-semibold tabular-nums transition ${isCur ? "ring-2 ring-navy-800" : ""} ${isAns ? "bg-teal-500 text-white" : "bg-navy-100 text-navy-600 hover:bg-navy-200"}`}
                        >
                          {q.n}
                          {isFlag && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-white" />}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-[10px] text-navy-400">
                    <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-teal-500" />Answered</span>
                    <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" />Flagged</span>
                  </div>
                  <p className="text-[11px] text-navy-500 mt-3 pt-3 border-t border-navy-100">{answeredCount} of {QUESTIONS.length} answered</p>
                </div>
                <button onClick={() => setShowConfirm(true)} className="w-full rounded-lg bg-teal-600 text-white py-2.5 text-sm font-medium hover:bg-teal-500">Submit exam</button>
              </div>
            </div>

            {/* Security strip */}
            <div className="border-t border-navy-200 bg-white px-4 sm:px-6 py-2.5">
              <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] text-navy-400">
                <span className="inline-flex items-center gap-1"><Icon name="lock" className="w-3.5 h-3.5" />Single session</span>
                <span className="inline-flex items-center gap-1"><Icon name="clock" className="w-3.5 h-3.5" />Time-limited</span>
                <span className="inline-flex items-center gap-1"><Icon name="log" className="w-3.5 h-3.5" />All actions logged</span>
                <span className="inline-flex items-center gap-1"><Icon name="shield" className="w-3.5 h-3.5" />No return after submit</span>
              </div>
            </div>

            {/* Confirm submit */}
            {showConfirm && (
              <div className="fixed inset-0 z-20 bg-navy-900/50 grid place-items-center p-4">
                <div className="bg-white rounded-xl p-6 max-w-md w-full">
                  <h2 className="text-lg font-semibold text-navy-900">Submit your exam?</h2>
                  <p className="text-sm text-navy-500 mt-2">
                    You have answered <span className="font-semibold text-navy-700">{answeredCount} of {QUESTIONS.length}</span> questions.
                    Once submitted your responses are <span className="font-semibold">locked</span> — you cannot return to the exam.
                  </p>
                  <div className="flex gap-2 mt-5">
                    <button onClick={() => setShowConfirm(false)} className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-navy-600 hover:bg-navy-100">Keep working</button>
                    <button onClick={submitExam} className="flex-1 rounded-lg bg-teal-600 text-white py-2.5 text-sm font-medium hover:bg-teal-500">Submit &amp; lock</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------- Time expired ------- */}
        {phase === "expired" && (
          <Centered>
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 grid place-items-center mx-auto mb-4"><Icon name="clock" className="w-8 h-8" /></div>
            <h1 className="text-xl font-semibold text-navy-900 text-center">Time expired</h1>
            <p className="text-sm text-navy-500 text-center mt-2">Your exam time has elapsed and the session is now locked. Your responses have been captured automatically and submitted for scoring.</p>
            <p className="text-xs text-navy-400 text-center mt-4">You may now close this window. No answers or scores are shown here.</p>
            <button onClick={submitExam} className="w-full mt-6 rounded-lg bg-navy-800 text-white py-2.5 text-sm font-medium hover:bg-navy-700">Acknowledge</button>
          </Centered>
        )}

        {/* ------- Phase 4: Submitted confirmation ------- */}
        {phase === "done" && (
          <Centered>
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 grid place-items-center mx-auto mb-4"><Icon name="check" className="w-8 h-8" /></div>
            <h1 className="text-xl font-semibold text-navy-900 text-center">Exam submitted</h1>
            <p className="text-sm text-navy-500 text-center mt-2">Your responses have been locked and securely recorded. Thank you for completing the exam.</p>
            <div className="rounded-lg bg-navy-50 border border-navy-100 p-4 mt-5 text-xs text-navy-500 space-y-1.5">
              <p className="flex items-center gap-2"><Icon name="lock" className="w-4 h-4 text-navy-400" />Responses are final — no changes can be made.</p>
              <p className="flex items-center gap-2"><Icon name="report" className="w-4 h-4 text-navy-400" />Your result will be released after review and approval.</p>
              <p className="flex items-center gap-2"><Icon name="shield" className="w-4 h-4 text-navy-400" />No answers or correct keys are ever displayed.</p>
            </div>
            <p className="text-sm font-medium text-navy-700 text-center mt-5">You may now close this window.</p>
          </Centered>
        )}
      </div>
    </Watermark>
  );
}

function Centered({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className={`bg-white rounded-2xl shadow-card border border-navy-100 p-6 sm:p-8 w-full ${wide ? "max-w-2xl" : "max-w-md"}`}>{children}</div>
    </div>
  );
}

function StepDots({ active }: { active: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-5">
      {[1, 2, 3, 4].map((n) => (
        <span key={n} className={`h-1.5 rounded-full transition-all ${n === active ? "w-6 bg-teal-500" : n < active ? "w-4 bg-teal-300" : "w-4 bg-navy-200"}`} />
      ))}
    </div>
  );
}
