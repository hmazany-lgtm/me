# Hook: After Program Completion

## Event

`after_program_completion`

Fires when the `after_session` hook for the final session of a program sets `is_final_session: true`. This is the gateway between session-level operations and program-level quality evaluation.

## Purpose

Validates that all sessions have complete data, consolidates session records, and initiates the program-level post-delivery review and quality decision pipeline.

## Steps Performed

### 1. Session Completeness Audit
- Retrieve all session records for the program from Google Sheets.
- Confirm every session has status `SESSION_COMPLETE`.
- Confirm attendance rosters, monitoring data, and feedback surveys are present for each session.
- **Block condition**: Any session record is incomplete → hold program in `AWAITING_SESSION_DATA`; notify Quality Monitor.

### 2. Minimum Feedback Threshold Check
- Calculate the overall feedback response rate across all sessions.
- If response rate < 50%: issue a final reminder via `integrations/messaging_mcp.md` to non-respondents; wait 24 hours before proceeding.
- Log the final response rate regardless of threshold.

### 3. Assessment Data Consolidation
- Pull all assessment results from `integrations/lms_attendance_mcp.md` across all sessions.
- Confirm no results are pending or unsynced.
- Write consolidated assessment data to Google Sheets program record.

### 4. Trainer Self-Assessment Deadline Check
- Confirm trainer self-assessment forms have been submitted for all sessions.
- If any outstanding after the 48-hour window: send a final reminder and log as `TRAINER_ASSESSMENT_LATE`.
- Proceed after 72 hours even if missing (missing forms noted in the quality report).

### 5. Program Record Consolidation
- Aggregate session-level records into a single program-level quality record in Google Sheets.
- Set program status to `AWAITING_QUALITY_REVIEW`.

### 6. Post-Delivery Review Agent Invocation
- Trigger the Post-Delivery Review Agent in program-summary mode with the consolidated program record.
- Pass `program_id` and links to all session data.

### 7. Stakeholder Notification
- Notify the following via `integrations/messaging_mcp.md` that the program has completed and is entering quality review:
  - Head of Quality
  - Program Director
  - Assigned trainer(s)
- Include estimated completion date for the quality report (default: 5 business days from program end).

### 8. Calendar Cleanup
- Mark the program as complete in `integrations/calendar_mcp.md`.
- Archive session events.

## Hook Response

```json
{
  "hook": "after_program_completion",
  "program_id": "<UUID>",
  "sessions_total": <int>,
  "sessions_complete": <int>,
  "data_complete": true | false,
  "feedback_response_rate_pct": <float>,
  "trainer_assessments_submitted": <int>,
  "trainer_assessments_total": <int>,
  "program_status": "AWAITING_QUALITY_REVIEW | AWAITING_SESSION_DATA",
  "post_delivery_agent_triggered": true | false,
  "estimated_report_date": "<ISO-8601 date>",
  "timestamp": "<ISO-8601>"
}
```

## On Block (Incomplete Session Data)

1. Program status set to `AWAITING_SESSION_DATA`.
2. Quality Monitor notified with list of incomplete session records.
3. Hook is re-triggered automatically once all sessions reach `SESSION_COMPLETE` status, or manually by Quality Monitor once data gaps are resolved.
4. Maximum hold period: 10 business days. After this, Quality Decision Agent proceeds with available data and notes the gaps in the report.
