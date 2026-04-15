# Integration: LMS Attendance MCP

## Purpose

The LMS Attendance MCP connects the quality agent system to the academy's Learning Management System (LMS). It is the source of truth for participant rosters, attendance data, assessment results, and completion certificates. Agents use it to pull live attendance during sessions and to write completion status after sessions end.

## MCP Server

```
server: lms-attendance-mcp
```

## Supported LMS Platforms

| Platform | Configuration Value |
|---|---|
| Moodle | `LMS_PLATFORM=moodle` |
| Canvas | `LMS_PLATFORM=canvas` |
| Cornerstone OnDemand | `LMS_PLATFORM=cornerstone` |
| TalentLMS | `LMS_PLATFORM=talentlms` |
| Custom REST API | `LMS_PLATFORM=custom` |

## Data Objects

### Participant Record

Sourced from the `Registrations` sheet in the Quality Workbook. The LMS holds the identity mapping; agents receive anonymised tokens only.

```json
{
  "participant_id": "<anonymised token — maps to Registrations.Email internally>",
  "program_id": "<UUID>",
  "session_date": "<YYYY-MM-DD — specific day within a multi-day program>",
  "company": "<Registrations.Company — e.g. Al Rajhi Bank, Aramco, Tawuniya>",
  "enrolment_status": "ENROLLED | PENDING_CONFIRMATION | WITHDRAWN",
  "join_time": "<ISO-8601 or null>",
  "leave_time": "<ISO-8601 or null>",
  "duration_minutes": <int>,
  "completion_status": "NOT_STARTED | IN_PROGRESS | ATTENDED | PARTIAL | ABSENT | COMPLETED",
  "assessment_score": <float or null>,
  "assessment_passed": true | false | null,
  "certificate_issued": true | false
}
```

### Registration Status Mapping

The `Registrations` sheet uses plain-language statuses. The LMS maps these on sync:

| Sheet `Status` | LMS `enrolment_status` | Behaviour |
|---|---|---|
| `Confirmed` | `ENROLLED` | Included in roster; eligible for completion credit and certificate |
| `Pending` | `PENDING_CONFIRMATION` | Included in roster for monitoring; no completion credit until confirmed |
| `Cancelled` | `WITHDRAWN` | Excluded from roster; not counted in attendance or pass-rate metrics |

### Assessment Result

```json
{
  "participant_id": "<anonymised ID>",
  "program_id": "<UUID>",
  "assessment_id": "<UUID>",
  "score": <float>,
  "passed": true | false,
  "attempt_number": <int>,
  "submitted_at": "<ISO-8601>",
  "question_responses": [
    {"question_id": "<id>", "correct": true | false, "score": <float>}
  ]
}
```

## Common Operations

### Pull participant roster for a session day

Programs may span multiple days (e.g. Insurance Fundamentals: 2026-07-15 → 2026-07-18). A separate roster call is made per session day.

```json
{
  "tool": "lms_get_roster",
  "program_id": "<UUID>",
  "session_date": "<YYYY-MM-DD>",
  "enrolment_status_filter": ["ENROLLED", "PENDING_CONFIRMATION"]
}
```

Returns array of Participant Records (enrolment data; attendance fields null until session starts). `WITHDRAWN` participants are excluded by default.

### Get live attendance (during session)

```json
{
  "tool": "lms_get_attendance",
  "session_id": "<UUID>",
  "as_of": "<ISO-8601>"
}
```

Returns array of Participant Records with current `join_time`, `leave_time`, and `duration_minutes` populated for participants who have joined.

### Update completion status (post-session)

```json
{
  "tool": "lms_update_completion",
  "session_id": "<UUID>",
  "completions": [
    {
      "participant_id": "<anonymised ID>",
      "completion_status": "ATTENDED | PARTIAL | ABSENT",
      "duration_minutes": <int>
    }
  ]
}
```

### Pull assessment results for a session

```json
{
  "tool": "lms_get_assessment_results",
  "program_id": "<UUID>",
  "session_id": "<UUID>",
  "assessment_id": "<UUID>"
}
```

Returns array of Assessment Result objects.

### Issue completion certificate

```json
{
  "tool": "lms_issue_certificate",
  "program_id": "<UUID>",
  "participant_id": "<anonymised ID>",
  "certificate_template": "<template ID>",
  "completion_date": "<ISO-8601 date>"
}
```

### Link session to attendance tracker

Called during Pre-Delivery Audit to confirm the session is properly configured in the LMS before delivery.

```json
{
  "tool": "lms_link_session",
  "program_id": "<UUID>",
  "session_id": "<UUID>",
  "platform_session_reference": "<external session ID from Zoom/Teams/etc.>"
}
```

## Polling Behaviour

The Live Online Monitoring Agent polls `lms_get_attendance` every 5 minutes during sessions. The MCP server caches responses for 60 seconds to avoid LMS rate limit breaches.

## Completion Thresholds

| Status | Attendance Duration | Credit Awarded |
|---|---|---|
| `ATTENDED` | ≥ 80% of session | Full completion credit |
| `PARTIAL` | 50–79% of session | Partial credit (programme-specific policy) |
| `ABSENT` | < 50% of session | No credit |

Thresholds are applied by the `after_session` hook when writing completion status.

## Data Privacy

- All participant IDs returned by this MCP are anonymised tokens. The mapping to real participant identities is held exclusively in the LMS and is never exposed to quality agents.
- Assessment response data (individual question answers) is used only for statistical analysis and is not stored in Google Sheets.
- Certificate records are held in the LMS; the quality agent system stores only a boolean flag (`certificate_issued`).

## Error Handling

- On connection failure: retry up to 3 times with 15-second intervals; alert Quality Monitor on persistent failure.
- On stale data (LMS returns data older than 10 minutes during a live session): log a warning and notify the Live Monitoring Agent; do not use stale data for attendance decisions.

## Environment Variables Required

```
LMS_PLATFORM=moodle | canvas | cornerstone | talentlms | custom
LMS_BASE_URL=<LMS instance URL>
LMS_MCP_API_KEY=<API key>
LMS_ATTENDANCE_THRESHOLD_ATTENDED=80
LMS_ATTENDANCE_THRESHOLD_PARTIAL=50
```
