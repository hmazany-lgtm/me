# Hook: After Session

## Event

`after_session`

Fires when a session ends — either at the scheduled end time or when the host closes the session, whichever is earlier. Triggered by the platform close event relayed through `integrations/lms_attendance_mcp.md`.

## Purpose

Ensures all session data is captured, persisted, and handed off correctly before the Live Online Monitoring Agent closes the session record. Also initiates participant feedback collection.

## Steps Performed

### 1. Final Attendance Snapshot
- Pull the definitive attendance roster from `integrations/lms_attendance_mcp.md`: join time, leave time, and duration per participant.
- Mark each participant as `ATTENDED` (≥ 80% of session duration) or `PARTIAL` or `ABSENT`.
- Write roster to Google Sheets under the session record.

### 2. Session Duration Reconciliation
- Record actual start time and actual end time.
- Calculate actual duration vs. scheduled duration.
- If actual duration < 80% of scheduled: flag as `SHORT_SESSION` and notify Program Director.
- If actual duration > 120% of scheduled: flag as `OVERTIME_SESSION`.

### 3. Monitoring Data Flush
- Signal the Live Online Monitoring Agent to write all buffered quality events and engagement metrics to Google Sheets.
- Confirm write success before proceeding.

### 4. Recording Finalisation (if recorded)
- Confirm recording has stopped and the file is accessible in the configured storage location.
- Log the recording URL to the session record in Google Sheets.
- If recording failed: log as `RECORDING_FAILED` and notify Quality Monitor.

### 5. Participant Feedback Survey Launch
- Trigger distribution of the post-session feedback survey via `integrations/messaging_mcp.md` to all `ATTENDED` and `PARTIAL` participants.
- Log survey send timestamp to session record.
- Set a 48-hour response window; schedule a reminder notification at the 24-hour mark.

### 6. LMS Completion Update
- Push attendance and completion status to the LMS via `integrations/lms_attendance_mcp.md`.
- Participants marked `ATTENDED` receive completion credit; `PARTIAL` participants receive partial credit per program policy.

### 7. Trainer Notification
- Send session completion summary to the trainer via `integrations/messaging_mcp.md`:
  - Attendance count and completion rate
  - Any quality events flagged during the session
  - Reminder to complete trainer self-assessment within 48 hours

### 8. Session Status Update
- Set session status to `SESSION_COMPLETE` in Google Sheets.
- If this was the final session of the program, trigger `hooks/after_program_completion.md`.

## Hook Response

```json
{
  "hook": "after_session",
  "session_id": "<UUID>",
  "program_id": "<UUID>",
  "is_final_session": true | false,
  "attendance_summary": {
    "attended": <int>,
    "partial": <int>,
    "absent": <int>
  },
  "actual_duration_minutes": <int>,
  "scheduled_duration_minutes": <int>,
  "duration_flag": "ON_TIME | SHORT_SESSION | OVERTIME_SESSION",
  "recording_status": "AVAILABLE | FAILED | NOT_CONFIGURED",
  "survey_sent": true | false,
  "lms_updated": true | false,
  "session_status": "SESSION_COMPLETE",
  "timestamp": "<ISO-8601>"
}
```

## On Error

Any step that fails is logged to Google Sheets. Critical failures (attendance not captured, LMS not updated) trigger an alert to the Quality Monitor via `integrations/messaging_mcp.md` for manual intervention within 1 hour.
