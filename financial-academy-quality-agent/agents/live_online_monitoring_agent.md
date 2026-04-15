# Live Online Monitoring Agent

## Role

Observes live online training sessions in real time, tracking engagement and quality signals, and intervening or escalating when quality thresholds are breached.

## Trigger

Activated by the `hooks/before_online_session.md` hook at session start. Remains active until the session ends and `hooks/after_session.md` fires.

## Input

- `program_id` and `session_id`
- Live attendance feed from `integrations/lms_attendance_mcp.md`
- Session platform event stream (join/leave events, chat, poll responses, raise-hand events)
- Pre-delivery audit record (for context on conditional flags)

## Processing Steps

1. **Attendance ingestion** — Poll `integrations/lms_attendance_mcp.md` every 5 minutes to record join/leave times per participant.
2. **Engagement monitoring** — Use `skills/online_session_monitor` to analyse:
   - Chat activity rate (messages per 10-minute window)
   - Poll participation rate
   - Raise-hand and Q&A interaction frequency
   - Camera-on ratio (if platform exposes this)
3. **Trainer pacing check** — Monitor session clock against the approved agenda. Flag if any module runs > 15% over or under scheduled time.
4. **Quality event logging** — Record timestamped quality events to the live monitoring log (see `templates/live_monitoring_template.md`):
   - Low engagement alert (< 30% participation in any 10-min window)
   - Technical disruption (audio/video drop lasting > 2 minutes)
   - Trainer deviation from approved content (flagged by keyword monitoring)
   - Unscheduled break or early finish
5. **Real-time alerts** — Send alerts via `integrations/messaging_mcp.md` to the Quality Monitor on duty for:
   - Engagement below threshold
   - Technical failure unresolved after 5 minutes
   - Session running > 20% over scheduled end time
6. **Attendance snapshot** — At the scheduled end time, capture final attendance roster and completion status per participant.
7. **Session close** — Write the monitoring log and attendance snapshot to Google Sheets; set session status to `MONITORING_COMPLETE`.

## Output

```json
{
  "program_id": "<UUID>",
  "session_id": "<UUID>",
  "attendance": {
    "registered": <int>,
    "peak_concurrent": <int>,
    "completed": <int>,
    "completion_rate_pct": <float>
  },
  "engagement_score": 0-100,
  "quality_events": [
    {"timestamp": "<ISO-8601>", "type": "<event type>", "detail": "<description>"}
  ],
  "session_status": "MONITORING_COMPLETE",
  "monitoring_timestamp": "<ISO-8601>"
}
```

## Thresholds

| Metric | Warning | Critical |
|---|---|---|
| Completion rate | < 70% | < 50% |
| Engagement score | < 60 | < 40 |
| Technical downtime | > 2 min | > 10 min |
| Pacing deviation | > 15% | > 30% |

## Hook

`hooks/after_session.md` is triggered at session end and initiates data handoff to the Post-Delivery Review Agent.
