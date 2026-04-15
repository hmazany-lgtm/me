# Skill: Post-Delivery Evaluator

## Purpose

Analyses all post-delivery evidence — participant feedback, assessment results, attendance and dropout data, session recordings, and design documentation — to produce structured scores and findings for the Post-Delivery Review Agent.

## Invocation

```
skill: post_delivery_evaluator
args:
  program_id: <UUID>
  session_date: <YYYY-MM-DD or null>   # null for program-level evaluation
  evaluation_type: "survey | assessment | dropout | recording | alignment | program_summary"
  data: <structured payload>
```

---

## Mode 1: Survey Analysis (`evaluation_type: "survey"`)

**Input**: Array of participant survey responses with Likert-scale ratings and open-text fields.

**Processing**:
1. Calculate mean and median for each rated dimension (content quality, trainer effectiveness, pacing, practical relevance).
2. Calculate Net Promoter Score from the recommendation question: `NPS = promoters_pct − detractors_pct` (promoters = 9–10; detractors = 0–6 on a 10-point scale).
3. Run sentiment analysis on open-text responses: classify each response as Positive / Neutral / Negative.
4. Extract recurring themes using frequency analysis — minimum 3 mentions to qualify as a named theme.
5. Flag any verbatim responses containing safeguarding, compliance, or conduct concerns for immediate escalation (do not include in standard output).
6. Compare overall satisfaction mean to the academy benchmark for this program sector (if available in Google Sheets).

**Output**:
```json
{
  "response_count": <int>,
  "response_rate_pct": <float>,
  "dimension_means": {
    "content_quality": <float>,
    "trainer_effectiveness": <float>,
    "pacing": <float>,
    "practical_relevance": <float>
  },
  "overall_satisfaction_mean": <float>,
  "nps": <int>,
  "nps_breakdown": {"promoters_pct": <float>, "passives_pct": <float>, "detractors_pct": <float>},
  "sentiment_distribution": {"positive_pct": <float>, "neutral_pct": <float>, "negative_pct": <float>},
  "top_themes": [
    {"theme": "<text>", "frequency": <int>, "sentiment": "positive | neutral | negative"}
  ],
  "academy_benchmark_comparison": {"sector_mean": <float or null>, "delta": <float or null>},
  "escalation_flags": ["<verbatim excerpt — safeguarding / conduct only>"]
}
```

---

## Mode 2: Assessment Analysis (`evaluation_type: "assessment"`)

**Input**: Array of participant assessment results with per-question scores.

**Processing**:
1. Calculate overall pass rate and mean score.
2. Identify questions with difficulty index < 0.40 (< 40% answered correctly) — flag as too difficult or poorly worded.
3. Identify questions with difficulty index > 0.95 — flag as potentially too easy.
4. Calculate reliability coefficient (Cronbach's alpha) if ≥ 10 questions.
5. Map questions to learning objectives (if objective mapping table provided) — calculate objective coverage rate.
6. Identify whether low-scoring questions cluster around specific objectives, suggesting a teaching gap rather than an assessment problem.

**Output**:
```json
{
  "participant_count": <int>,
  "pass_rate_pct": <float>,
  "mean_score": <float>,
  "reliability_alpha": <float or null>,
  "objective_coverage_rate_pct": <float or null>,
  "flagged_difficult_questions": [
    {"question_id": "<id>", "objective_mapped": "<objective>", "difficulty_index": <float>, "likely_cause": "teaching_gap | poor_wording | content_gap"}
  ],
  "flagged_easy_questions": [
    {"question_id": "<id>", "difficulty_index": <float>}
  ],
  "teaching_gap_objectives": ["<objective text>"]
}
```

---

## Mode 3: Dropout Analysis (`evaluation_type: "dropout"`)

**Input**: Session-by-session attendance records across all program days; enrolment status from `integrations/lms_attendance_mcp.md`.

**Processing**:
1. Identify all participants who attended ≥ 1 day but did not complete the program (`PARTIAL` or `ABSENT` on subsequent days).
2. Classify dropout timing: early (Day 1–2), mid-program, late (final day only missed).
3. Identify clustering patterns:
   - **By day**: Did dropout spike on a specific session day? (suggests that day's content or experience was problematic)
   - **By company**: Did dropout cluster within a single employer? (may indicate external work pressures rather than program quality)
   - **Post-assessment**: Did dropout occur primarily after an assessment? (suggests difficulty or perceived failure risk)
   - **Random**: No discernible pattern
4. Calculate completion rate and compare to the academy benchmark for this program type.

**Output**:
```json
{
  "enrolled_count": <int>,
  "completed_count": <int>,
  "partial_count": <int>,
  "absent_count": <int>,
  "completion_rate_pct": <float>,
  "dropout_count": <int>,
  "dropout_timing": {
    "early_pct": <float>,
    "mid_pct": <float>,
    "late_pct": <float>
  },
  "dropout_pattern": "by_day | by_company | post_assessment | random | mixed",
  "spike_session_date": "<YYYY-MM-DD or null>",
  "spike_company": "<company name or null>",
  "rf07_triggered": true | false,
  "academy_benchmark_completion_pct": <float or null>
}
```

---

## Mode 4: Recording Spot-Check (`evaluation_type: "recording"`)

**Input**: Recording URL and three timestamp ranges (each 10 minutes) selected by the Post-Delivery Review Agent. Segments should be selected to cover: early session, mid-session, and late session.

**Processing**:
1. Retrieve and transcribe each segment.
2. Score trainer delivery across: clarity of explanation, pacing, use of examples, responsiveness to questions, energy and engagement.
3. Cross-reference content against approved materials: flag any deviations, omissions, or unauthorised additions.
4. Check compliance language: verify required disclosures were stated at appropriate points.
5. Check for evidence of comprehension checks (posed questions, polls referenced, worked examples).

**Output**:
```json
{
  "segments_reviewed": 3,
  "trainer_delivery_score": 0-100,
  "content_accuracy_score": 0-100,
  "compliance_language_score": 0-100,
  "comprehension_checks_observed": <int>,
  "deviations": [
    {"timestamp": "<HH:MM:SS>", "type": "omission | addition | inaccuracy | compliance_gap", "severity": "CRITICAL | MAJOR | MINOR", "detail": "<description>"}
  ]
}
```

---

## Mode 5: Design-Delivery Alignment (`evaluation_type: "alignment"`)

**Input**: Approved program design (from pre-delivery audit record in Google Sheets) + all post-delivery evidence (monitoring log, trainer notes, observer notes, operational incidents).

**Processing**:
1. Pull the approved agenda, planned activities list, and learning objectives from the pre-delivery audit record.
2. For each planned activity, check whether it was executed (from monitoring log, trainer notes, observer notes).
3. Identify deviations:
   - **Skipped**: planned activity not executed with no documented reason
   - **Modified**: activity executed in a significantly different form
   - **Substituted**: replaced by an unplanned activity
   - **Forced by incident**: deviation caused by technical or operational failure
4. Calculate execution rate: `executed_as_planned / total_planned × 100`
5. Assess whether deviations had a positive, neutral, or negative impact on learning (based on participant feedback and observer notes).
6. Identify whether skipped activities correspond to RF-09 (weak closure / action transfer) or RF-03 (passive delivery).

**Output**:
```json
{
  "planned_activities_count": <int>,
  "executed_as_planned_count": <int>,
  "execution_rate_pct": <float>,
  "deviations": [
    {
      "planned_activity": "<description>",
      "type": "skipped | modified | substituted | forced_by_incident",
      "session_date": "<YYYY-MM-DD>",
      "reason": "<from trainer notes or incident log, or null>",
      "learning_impact": "positive | neutral | negative | unknown"
    }
  ],
  "objectives_at_risk_from_deviations": ["<objective text>"],
  "rf_implications": ["RF-03", "RF-09"]
}
```

---

## Mode 6: Program Summary (`evaluation_type: "program_summary"`)

**Input**: All per-session evaluation outputs across all modes for the program.

**Processing**:
1. Aggregate all scores with session weighting (weighted by attendance count per session day).
2. Calculate trend slopes across session days for satisfaction, engagement score, and assessment pass rate.
3. Identify the best and worst performing session days with key differentiating factors.
4. Summarise the top 5 recurring improvement themes across all open-text feedback and observer notes.
5. Cross-reference all dropout, design alignment, and red flag data into a unified risk narrative.

**Output**:
```json
{
  "sessions_evaluated": <int>,
  "aggregated_satisfaction_mean": <float>,
  "aggregated_nps": <int>,
  "aggregated_pass_rate_pct": <float>,
  "aggregated_completion_rate_pct": <float>,
  "satisfaction_trend": "IMPROVING | STABLE | DECLINING",
  "assessment_trend": "IMPROVING | STABLE | DECLINING",
  "engagement_trend": "IMPROVING | STABLE | DECLINING",
  "best_session_date": "<YYYY-MM-DD>",
  "worst_session_date": "<YYYY-MM-DD>",
  "top_improvement_themes": [
    {"theme": "<text>", "frequency": <int>, "source": "feedback | observer | monitoring"}
  ],
  "active_red_flags_summary": ["RF-07", "RF-08"],
  "risk_narrative": "<2-3 sentence unified risk summary>"
}
```

---

## Notes

- Participant IDs are anonymised in all outputs. Company names may appear in dropout clustering analysis.
- The alignment analysis (Mode 5) requires the pre-delivery audit record to be available in Google Sheets. If it is not, record `execution_rate_pct: null` and note the gap.
- Safeguarding and conduct escalation flags from Mode 1 are returned in the output but must not be included in any stakeholder-facing report. They route directly to the Head of Quality.
- Mode 6 (Program Summary) should always be run last, after all other modes have completed for all session days.
