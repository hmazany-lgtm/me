# Post-Delivery Review Agent

## Role

Aggregates all post-session data — participant feedback, assessment results, monitoring logs, and recording analysis — into a comprehensive quality evidence package that feeds the Quality Decision Agent.

## Trigger

Activated by `hooks/after_session.md` after each session, and again by `hooks/after_program_completion.md` when the final session of a program completes.

## Input

- `program_id` and `session_id`(s)
- Live monitoring output from the Live Online Monitoring Agent (Google Sheets)
- Participant feedback survey responses (collected via LMS or linked form)
- Assessment / quiz results from `integrations/lms_attendance_mcp.md`
- Session recording URL (if recorded)
- Trainer self-assessment form

## Processing Steps

### Per Session (triggered by `after_session` hook)

1. **Feedback ingestion** — Pull survey responses from the LMS. Calculate:
   - Overall satisfaction score (mean, median, distribution)
   - Net Promoter Score (NPS)
   - Per-dimension ratings: content quality, trainer effectiveness, pacing, relevance
   - Open-text themes (use `skills/post_delivery_evaluator` for sentiment and theme extraction)
2. **Assessment analysis** — Retrieve quiz/assessment scores. Calculate:
   - Pass rate
   - Mean score
   - Question-level difficulty index (flag questions with < 40% correct rate)
3. **Recording spot-check** — If a recording exists, use `skills/post_delivery_evaluator` to sample 3 × 10-minute segments and score:
   - Trainer delivery quality
   - Accuracy of content against approved materials
   - Compliance language adherence
4. **Session evidence package** — Compile results into `templates/post_delivery_template.md` and write to Google Sheets.

### Per Program (triggered by `after_program_completion` hook)

5. **Cross-session aggregation** — Merge all per-session evidence packages for the program.
6. **Trend analysis** — Identify engagement, satisfaction, and assessment trends across sessions (improving / stable / declining).
7. **Outcome alignment** — Compare actual learning outcomes (assessment pass rates, participant-reported competency gains) against the program's stated learning objectives.
8. **Trainer performance summary** — Aggregate trainer scores across sessions; flag significant variance between sessions.
9. **Program evidence package** — Compile the full program review into `templates/post_delivery_template.md` (program-level section) and route to Quality Decision Agent.

## Output

```json
{
  "program_id": "<UUID>",
  "sessions_reviewed": <int>,
  "satisfaction": {
    "mean_score": <float>,
    "nps": <int>,
    "response_rate_pct": <float>
  },
  "assessment": {
    "pass_rate_pct": <float>,
    "mean_score": <float>,
    "flagged_questions": <int>
  },
  "trainer_performance_score": 0-100,
  "content_accuracy_score": 0-100,
  "outcome_alignment_score": 0-100,
  "open_text_themes": ["<theme>", ...],
  "review_status": "COMPLETE",
  "review_timestamp": "<ISO-8601>"
}
```

## Escalation

- Response rate < 50%: send reminder notification to participants via `integrations/messaging_mcp.md` 48 h after session.
- Assessment pass rate < 60%: flag to Program Director for curriculum review.
- Content accuracy score < 70% on recording spot-check: escalate to Head of Quality immediately.
