# Integration: Calendar MCP

## Purpose

The Calendar MCP provides read and write access to the academy's scheduling system. Agents use it to verify session schedules, check trainer availability, send participant invitations, and update event status throughout the program lifecycle.

## MCP Server

```
server: calendar-mcp
```

## Supported Calendar Backends

The MCP server abstracts the underlying calendar provider. Supported backends:

- Google Calendar (default)
- Microsoft 365 / Outlook Calendar
- iCalendar feed (read-only)

The backend is configured via the `CALENDAR_BACKEND` environment variable.

## Calendar Structure

| Calendar Name | Used By | Purpose |
|---|---|---|
| `Academy Programs` | All agents | Master program schedule (one event per session) |
| `Trainer Schedule` | Pre-Delivery Audit, before_program_approval hook | Trainer availability and booking |
| `Quality Reviews` | Quality Decision Agent | Scheduled quality review meetings |
| `Participant Invites` | after_session hook | Participant-facing session events |

## Common Operations

### Create a session event

```json
{
  "tool": "calendar_create_event",
  "calendar": "Academy Programs",
  "event": {
    "title": "<Program Title> — Session <N>",
    "start": "<ISO-8601 datetime>",
    "end": "<ISO-8601 datetime>",
    "description": "<program_id>:<session_id>",
    "attendees": ["<trainer email>", "<quality.monitor@academy.com>"],
    "location": "<platform join URL or venue>"
  }
}
```

### Check trainer availability

```json
{
  "tool": "calendar_check_availability",
  "calendar": "Trainer Schedule",
  "resource": "<trainer email>",
  "start": "<ISO-8601 datetime>",
  "end": "<ISO-8601 datetime>"
}
```

Returns: `{"available": true | false, "conflicts": [<event summaries>]}`

### Update event status

```json
{
  "tool": "calendar_update_event",
  "event_id": "<calendar event ID>",
  "updates": {
    "status": "confirmed | cancelled | tentative",
    "description": "<appended notes>"
  }
}
```

### Send participant invites

```json
{
  "tool": "calendar_invite_participants",
  "event_id": "<calendar event ID>",
  "emails": ["<participant1@org.com>", "..."],
  "message": "<optional custom invite message>"
}
```

### Query upcoming sessions for a program

```json
{
  "tool": "calendar_query_events",
  "calendar": "Academy Programs",
  "filter": {"description_contains": "<program_id>"},
  "from": "<ISO-8601 date>",
  "to": "<ISO-8601 date>"
}
```

## Session Event Naming Convention

```
[Program Code] — [Program Title] — Session [N] of [Total]
```

Example: `FA-2024-007 — Advanced MiFID II Compliance — Session 2 of 4`

## Trigger Integration

The calendar MCP is the source of session schedule data that fires the `hooks/before_online_session.md` hook. A scheduled job polls `Academy Programs` for events starting within 35 minutes and triggers the hook for any event with a matching `program_id` and `session_id` in the description.

## Error Handling

- Scheduling conflicts detected by `calendar_check_availability` are surfaced as blocking errors in the `before_program_approval` hook.
- Failed event creation retries up to 3 times with 10-second intervals; on persistent failure, alerts Quality Coordinator via `integrations/messaging_mcp.md`.

## Environment Variables Required

```
CALENDAR_BACKEND=google | outlook | ical
CALENDAR_MCP_CREDENTIALS=<service account key path or OAuth token>
ACADEMY_CALENDAR_ID=<primary calendar ID>
TRAINER_CALENDAR_ID=<trainer schedule calendar ID>
```
