# Hook: Before Online Session

## Event

`before_online_session`

Fires 30 minutes before each scheduled online session start time. Triggered from the session schedule in `integrations/calendar_mcp.md`. If this hook fails critical checks, the session host and Quality Monitor on duty are alerted immediately; delivery may be delayed or cancelled depending on severity.

## Purpose

Performs final go/no-go technical and readiness checks in the window immediately before a live session, when issues can still be remediated without significant participant impact.

## Checks Performed

### 1. Platform Availability
- Ping the session platform endpoint to confirm it is reachable and returning healthy status.
- **Critical**: Platform unreachable or returning errors → immediate alert; activate backup platform if configured.

### 2. Host Credentials Active
- Confirm the host/trainer account can authenticate to the platform (token refresh or login test).
- **Critical**: Authentication failure → notify trainer and IT support immediately.

### 3. Attendance Link Validation
- Verify the participant join link is active and redirects correctly.
- Confirm the link is the same as distributed in the calendar invite.
- **Critical**: Broken or mismatched link → regenerate and redistribute via `integrations/messaging_mcp.md`.

### 4. LMS Attendance Tracker Sync
- Confirm `integrations/lms_attendance_mcp.md` is connected to this session and the roster is loaded.
- **Warning**: LMS connection unavailable → manual attendance sheet prepared as fallback.

### 5. Recording Configuration (if session is recorded)
- Verify recording is enabled and storage location is accessible.
- **Warning**: Recording setup incomplete → log and proceed; manual start reminder sent to trainer.

### 6. Trainer Confirmation
- Check that the trainer has confirmed readiness within the last 2 hours (via a confirmation message or automated check-in).
- **Critical**: No confirmation → call/message trainer directly; escalate to backup trainer if no response within 15 minutes.

### 7. Poll and Material Upload Check
- Confirm any pre-loaded polls, slides, or breakout configurations are present in the platform session.
- **Warning**: Missing materials → notify trainer to upload before session start.

## Hook Response

```json
{
  "hook": "before_online_session",
  "session_id": "<UUID>",
  "program_id": "<UUID>",
  "check_timestamp": "<ISO-8601>",
  "result": "PASS | WARN | CRITICAL",
  "checks": [
    {"name": "<check name>", "status": "PASS | WARN | CRITICAL", "detail": "<optional message>"}
  ],
  "actions_taken": ["<description of automated remediation if any>"],
  "escalation_sent": true | false
}
```

## On CRITICAL

1. Immediate notification to trainer, Quality Monitor on duty, and Program Director via `integrations/messaging_mcp.md`.
2. If issue cannot be resolved within 20 minutes of session start time, Quality Monitor has authority to delay or cancel the session.
3. Cancellation triggers participant notification (via messaging integration) and calendar update.
4. Incident logged to Google Sheets with full hook output.

## On WARN

- Notification sent to trainer and Quality Monitor only.
- Session proceeds; Live Online Monitoring Agent is briefed on the outstanding warning.
