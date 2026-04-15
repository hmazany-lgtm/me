# Integration: Google Sheets MCP

## Purpose

Google Sheets is the system of record for all quality data in the Financial Academy Quality Agent pipeline. Every agent reads from and writes to specific sheets within the designated Quality Workbook. The MCP server provides structured read/write access without requiring direct Sheets API credentials in agent prompts.

## MCP Server

```
server: google-sheets-mcp
```

## Quality Workbook Structure

The workbook is identified by the `QUALITY_WORKBOOK_ID` environment variable. It contains the following sheets:

### Source Sheets (populated externally / by academy operations staff)

These two sheets are the primary data entry point for the system. All other sheets are written by agents.

**`ProgramSchedule`** — one row per program

| Column | Type | Example |
|---|---|---|
| Program Title | Text | `Insurance Fundamentals` |
| Sector | Text | `Insurance` |
| Start Date | Date (YYYY-MM-DD) | `2026-07-15` |
| End Date | Date (YYYY-MM-DD) | `2026-07-18` |
| Trainer Name | Text | `Mohammed Alhamazany` |
| Location | Text | `Jeddah` · `Online` · `Riyadh` · `London` |
| Start Time | Time (HH:MM) | `08:30` |
| End Time | Time (HH:MM) | `16:30` |

**`Registrations`** — one row per attendee

| Column | Type | Example |
|---|---|---|
| Attendee Name | Text | `علي الحسن` |
| Program Title | Text | `Insurance Fundamentals` |
| Trainer Name | Text | `Mohammed Alhamazany` |
| Email | Email | `ali.h@company.com` |
| Phone | Text | `966501234575` |
| Company | Text | `Malath` |
| Status | Text | `Confirmed` · `Pending` · `Cancelled` |

**Registration Status → System Status Mapping**

| Sheet Status | System `enrolment_status` | Included in Roster? |
|---|---|---|
| `Confirmed` | `ENROLLED` | Yes |
| `Pending` | `PENDING_CONFIRMATION` | Yes (read-only; no completion credit until confirmed) |
| `Cancelled` | `WITHDRAWN` | No |

### Agent-Managed Sheets

| Sheet Name | Owner Agent(s) | Purpose |
|---|---|---|
| `ProgramRegister` | Intake, Quality Decision | Master list of all programs with system UUIDs and pipeline status |
| `IntakeRecords` | Program Intake Agent | One row per intake submission with validation results |
| `PreDeliveryAudits` | Pre-Delivery Audit Agent | Audit results and checklist outcomes per program |
| `SessionMonitoring` | Live Monitoring Agent | Per-session quality events and engagement metrics |
| `AttendanceRosters` | Live Monitoring, after_session hook | Participant attendance per session (enriched from `Registrations`) |
| `FeedbackSurveys` | Post-Delivery Review Agent | Aggregated survey scores per session |
| `AssessmentResults` | Post-Delivery Review Agent | Assessment pass rates and question analysis |
| `QualityDecisions` | Quality Decision Agent | Final scores, bands, certification decisions |
| `ImprovementDirectives` | Quality Decision Agent | Open and resolved improvement actions |
| `RegRegulatoryApprovals` | before_program_approval hook | Currency of regulatory approvals |
| `TrainerCredentials` | Program Intake Agent | Trainer credential register and expiry dates |

### `ProgramRegister` Schema

Written by the Program Intake Agent when it processes a row from `ProgramSchedule`.

| Column | Source |
|---|---|
| `program_id` | UUID generated at intake |
| `program_title` | `ProgramSchedule.Program Title` |
| `sector` | `ProgramSchedule.Sector` |
| `start_date` | `ProgramSchedule.Start Date` |
| `end_date` | `ProgramSchedule.End Date` |
| `trainer_name` | `ProgramSchedule.Trainer Name` |
| `location` | `ProgramSchedule.Location` |
| `delivery_mode` | Derived: `Online` if Location = "Online", else `In-Person` |
| `daily_start_time` | `ProgramSchedule.Start Time` |
| `daily_end_time` | `ProgramSchedule.End Time` |
| `duration_days` | Calculated: End Date − Start Date + 1 |
| `daily_hours` | Calculated: End Time − Start Time |
| `status` | Pipeline status (e.g. `INTAKE_COMPLETE`, `CERTIFIED`) |
| `updated_at` | ISO-8601 timestamp |

### `AttendanceRosters` Schema

Enriched from `Registrations` at session start. One row per participant per session day.

| Column | Source |
|---|---|
| `participant_id` | Anonymised token (maps to `Registrations.Email` in LMS only) |
| `program_id` | FK → `ProgramRegister.program_id` |
| `session_date` | Date of the specific day within the multi-day program |
| `company` | `Registrations.Company` |
| `enrolment_status` | Mapped from `Registrations.Status` |
| `join_time` | Populated during/after session |
| `leave_time` | Populated during/after session |
| `duration_minutes` | Calculated post-session |
| `completion_status` | `ATTENDED` · `PARTIAL` · `ABSENT` |

## Common Operations

### Read a program record

```json
{
  "tool": "google_sheets_read",
  "sheet": "ProgramRegister",
  "filter": {"column": "program_id", "value": "<UUID>"}
}
```

### Write / update a program status

```json
{
  "tool": "google_sheets_write",
  "sheet": "ProgramRegister",
  "match": {"column": "program_id", "value": "<UUID>"},
  "values": {"status": "INTAKE_COMPLETE", "updated_at": "<ISO-8601>"}
}
```

### Append a new row

```json
{
  "tool": "google_sheets_append",
  "sheet": "IntakeRecords",
  "row": { ... }
}
```

### Query with multiple filters

```json
{
  "tool": "google_sheets_read",
  "sheet": "QualityDecisions",
  "filter": [
    {"column": "program_id", "value": "<UUID>"},
    {"column": "certification_status", "value": "CERTIFIED"}
  ]
}
```

## Data Conventions

- All timestamps are stored in ISO-8601 format (UTC).
- UUIDs are version 4, generated at intake.
- Boolean fields use `TRUE` / `FALSE` (Google Sheets native).
- Score fields are stored as numbers (not strings).
- Status fields use the `ALL_CAPS_WITH_UNDERSCORES` convention defined in each agent's output schema.

## Permissions

| Role | Access Level |
|---|---|
| Quality Agents (automated) | Read + Write to designated sheets |
| Quality Coordinators | Read + Write to all sheets |
| Program Directors | Read only |
| Trainers | Read — own program records only |
| Head of Quality | Read + Write to all sheets; can delete rows |

## Error Handling

- On write failure: agent retries once after 5 seconds. On second failure, logs to local buffer and alerts Quality Monitor via `integrations/messaging_mcp.md`.
- On read failure: agent waits 10 seconds and retries. After 3 failures, raises a blocking error to the calling agent.
- Quota limits: the MCP server handles rate limiting transparently with exponential back-off.

## Environment Variables Required

```
QUALITY_WORKBOOK_ID=<Google Sheets file ID>
GOOGLE_SHEETS_MCP_CREDENTIALS=<service account key path or OAuth token>
```
