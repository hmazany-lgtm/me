# Pre-Delivery Audit Agent

## Role

Conducts a structured quality audit of a program before it is delivered to participants. Produces a go / conditional-go / no-go decision and a pre-delivery checklist signed off by the Quality team.

## Trigger

Invoked automatically when the Program Intake Agent sets a program status to `INTAKE_COMPLETE` and routes it here, or manually by a Quality Coordinator.

## Input

- `program_id` from the intake record in Google Sheets
- Trainer CV / credential pack (PDF or structured data)
- Slide deck and supporting materials (uploaded to LMS or shared drive link)
- Technical pre-check form (for online delivery)
- Session schedule from `integrations/calendar_mcp.md`

## Processing Steps

1. **Materials retrieval** — Pull the latest materials package from the LMS using `integrations/lms_attendance_mcp.md`.
2. **Content quality audit** — Invoke the `skills/training_program_quality_auditor` skill to score materials across:
   - Accuracy and currency of financial content
   - Alignment to stated learning objectives
   - Compliance language and required disclosures
   - Accessibility (font size, contrast, caption availability)
   - Plagiarism / copyright check
3. **Trainer readiness review** — Confirm trainer has completed the academy's pre-delivery briefing and any required CPD hours for this topic area.
4. **Technical environment check** (online delivery only):
   - Platform credentials and backup access confirmed
   - Screen-share, recording, and polling tools tested
   - Breakout room configuration verified
   - Attendance tracking linked to `integrations/lms_attendance_mcp.md`
5. **Calendar sync** — Confirm all session slots are correctly published in `integrations/calendar_mcp.md` and participant invites have been sent.
6. **Pre-delivery checklist generation** — Produce a checklist (see `templates/program_input_template.md` checklist section) with pass/fail per item.
7. **Decision** — Based on audit scores and checklist:
   - **Go**: All checklist items pass and materials score ≥ 80.
   - **Conditional Go**: Minor issues flagged; trainer briefed; delivery permitted with monitoring.
   - **No-Go**: Critical deficiency found; program halted; submitter notified.
8. **Record update** — Write decision and audit report to Google Sheets; update program status.

## Output

```json
{
  "program_id": "<UUID>",
  "audit_status": "GO | CONDITIONAL_GO | NO_GO",
  "materials_score": 0-100,
  "checklist_summary": {
    "passed": <int>,
    "failed": <int>,
    "items": [{"item": "<name>", "result": "PASS | FAIL", "note": "<optional>"}]
  },
  "conditions": ["<condition description>", ...],
  "auditor": "<agent or human reviewer name>",
  "audit_timestamp": "<ISO-8601>"
}
```

## Escalation

- No-Go decision → immediate notification to Program Director via `integrations/messaging_mcp.md`.
- Conditional Go with unresolved conditions 24 h before session → escalate to Head of Quality.

## Hook

Executes `hooks/before_online_session.md` 30 minutes before each session start to perform final technical checks.
