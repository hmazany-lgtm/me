# Integration: Google Sheets MCP

## Purpose

Google Sheets is the system of record for all quality data in the Financial Academy Quality Agent pipeline. Every agent reads from and writes to specific sheets within the designated Quality Workbook. The MCP server provides structured read/write access without requiring direct Sheets API credentials in agent prompts.

## MCP Server

```
server: google-sheets-mcp
```

## Quality Workbook Structure

The workbook is identified by the `QUALITY_WORKBOOK_ID` environment variable. It contains the following sheets:

| Sheet Name | Owner Agent(s) | Purpose |
|---|---|---|
| `ProgramRegister` | Intake, Quality Decision | Master list of all programs and their current status |
| `IntakeRecords` | Program Intake Agent | One row per intake submission with validation results |
| `PreDeliveryAudits` | Pre-Delivery Audit Agent | Audit results and checklist outcomes per program |
| `SessionMonitoring` | Live Monitoring Agent | Per-session quality events and engagement metrics |
| `AttendanceRosters` | Live Monitoring, after_session hook | Participant attendance per session |
| `FeedbackSurveys` | Post-Delivery Review Agent | Aggregated survey scores per session |
| `AssessmentResults` | Post-Delivery Review Agent | Assessment pass rates and question analysis |
| `QualityDecisions` | Quality Decision Agent | Final scores, bands, certification decisions |
| `ImprovementDirectives` | Quality Decision Agent | Open and resolved improvement actions |
| `RegRegulatoryApprovals` | before_program_approval hook | Currency of regulatory approvals |
| `TrainerCredentials` | Program Intake Agent | Trainer credential register and expiry dates |

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
