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

### Create a multi-day program block

Programs span multiple consecutive days with fixed daily start/end times (sourced from `ProgramSchedule`). One all-day event is created for the program block, plus individual daily events for each session day.

**Program block (spans full date range):**

```json
{
  "tool": "calendar_create_event",
  "calendar": "Academy Programs",
  "event": {
    "title": "<Program Title> [<Sector>]",
    "start": "<Start Date>T00:00:00",
    "end": "<End Date>T23:59:59",
    "all_day": true,
    "description": "program_id:<UUID> | trainer:<Trainer Name> | sector:<Sector>",
    "location": "<Location>",
    "attendees": ["<trainer email>", "<quality.monitor@academy.com>"]
  }
}
```

**Daily session event (one per day in the date range):**

```json
{
  "tool": "calendar_create_event",
  "calendar": "Academy Programs",
  "event": {
    "title": "<Program Title> — Day <N> of <Total Days>",
    "start": "<YYYY-MM-DD>T<Start Time>:00",
    "end": "<YYYY-MM-DD>T<End Time>:00",
    "description": "program_id:<UUID> | session_date:<YYYY-MM-DD>",
    "location": "<Location — physical address or 'Online'>",
    "attendees": ["<trainer email>", "<quality.monitor@academy.com>"]
  }
}
```

**Real examples from current program schedule:**

| Program | Days | Daily Hours | Location |
|---|---|---|---|
| Certified Compliance Officer | 2026-05-01 → 05-05 (5 days) | 09:00–15:00 | Riyadh |
| Data Analysis & Reporting | 2026-06-10 → 06-12 (3 days) | 10:00–14:00 | Online |
| Insurance Fundamentals | 2026-07-15 → 07-18 (4 days) | 08:30–16:30 | Jeddah |
| IPO Masterclass | 2026-08-20 → 08-22 (3 days) | 09:00–17:00 | London |

**Location handling:**
- Physical locations (`Riyadh`, `Jeddah`, `London`) → set as venue string; no platform join URL.
- `Online` → set location as platform join URL; trigger `hooks/before_online_session.md` 30 min before each daily start time.

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

Daily events follow this format:

```
[Program Title] — Day [N] of [Total] ([Sector])
```

Examples from current schedule:

```
Insurance Fundamentals — Day 1 of 4 (Insurance)
IPO Masterclass — Day 2 of 3 (Capital Market)
Data Analysis & Reporting — Day 3 of 3 (Banking)
```

## Trigger Integration

The calendar MCP fires lifecycle hooks based on daily session events:

| Hook | Trigger condition |
|---|---|
| `hooks/before_online_session.md` | Online programs only — 30 min before each day's `Start Time` |
| `hooks/after_session.md` | All programs — at each day's `End Time` |
| `hooks/after_program_completion.md` | All programs — at the `End Time` on the `End Date` |

A scheduled job polls `Academy Programs` for daily events matching `program_id` in the description. For in-person programs (Riyadh, Jeddah, London), `before_online_session.md` is skipped; only `after_session.md` and `after_program_completion.md` fire.

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
