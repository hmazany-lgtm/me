# Quality Decision Agent

## Role

The final stage of the quality pipeline. Synthesises evidence from all preceding agents, calculates the composite quality score, issues a certification decision, generates improvement directives, and produces the executive quality report.

## Trigger

Invoked by the Post-Delivery Review Agent after the program-level evidence package is complete (i.e., after `hooks/after_program_completion.md` fires and post-delivery review is done).

## Input

- `program_id`
- Pre-delivery audit record (from Pre-Delivery Audit Agent)
- Live monitoring summary (from Live Online Monitoring Agent)
- Post-delivery evidence package (from Post-Delivery Review Agent)
- Historical quality data for the same program (if repeat delivery) from Google Sheets

## Processing Steps

1. **Evidence assembly** — Pull all quality records for the program from Google Sheets using `integrations/google_sheets_mcp.md`.
2. **Score calculation** — Invoke `skills/quality_score_calculator` with the assembled evidence. The calculator applies the weighted model defined in `CLAUDE.md`:
   - Content Accuracy & Compliance (30%)
   - Trainer Competence & Delivery (25%)
   - Participant Engagement & Satisfaction (25%)
   - Technical & Logistical Execution (10%)
   - Post-Delivery Outcomes (10%)
3. **Band assignment** — Map composite score to quality band (Excellent / Good / Needs Improvement / Unsatisfactory).
4. **Certification decision**:
   - Excellent / Good → **Certified**; issue digital certificate and log to quality register.
   - Needs Improvement → **Conditional Certification**; generate mandatory action plan with deadlines.
   - Unsatisfactory → **Not Certified**; suspend program; escalate to Head of Quality and Program Director.
5. **Improvement directives** — For any dimension scoring below 75, generate specific, measurable improvement recommendations with an owner and target date.
6. **Historical comparison** — If prior delivery exists, calculate score delta and trend direction (improved / stable / declined).
7. **Executive report** — Invoke `skills/executive_report_writer` with all decision data and `templates/executive_report_template.md` to produce the final report.
8. **Distribution** — Send the executive report via `integrations/messaging_mcp.md` to:
   - Head of Quality
   - Program Director
   - Assigned Trainer(s)
   - (Optionally) Sponsor / Client contact
9. **Register update** — Write the final quality decision, score, and certification status to the programme quality register in Google Sheets.

## Output

```json
{
  "program_id": "<UUID>",
  "composite_score": 0-100,
  "quality_band": "EXCELLENT | GOOD | NEEDS_IMPROVEMENT | UNSATISFACTORY",
  "certification_status": "CERTIFIED | CONDITIONAL | NOT_CERTIFIED",
  "dimension_scores": {
    "content_accuracy_compliance": 0-100,
    "trainer_competence_delivery": 0-100,
    "engagement_satisfaction": 0-100,
    "technical_logistical": 0-100,
    "post_delivery_outcomes": 0-100
  },
  "improvement_directives": [
    {
      "dimension": "<name>",
      "finding": "<description>",
      "recommendation": "<action>",
      "owner": "<role>",
      "due_date": "<ISO-8601>"
    }
  ],
  "score_delta_vs_prior": <float or null>,
  "trend": "IMPROVED | STABLE | DECLINED | FIRST_DELIVERY",
  "report_url": "<Google Sheets / Drive link>",
  "decision_timestamp": "<ISO-8601>"
}
```

## Escalation

- Not Certified decision → automatic suspension flag written to LMS; notification sent within 1 hour.
- Conditional Certification with no action plan response after 14 days → re-escalate to Head of Quality.

## Hook

`hooks/after_program_completion.md` must succeed before this agent begins processing.
