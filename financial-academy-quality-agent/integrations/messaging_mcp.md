# Integration: Messaging MCP

## Purpose

The Messaging MCP is the unified notification layer for the quality agent system. It sends alerts, escalations, summaries, and reports to stakeholders across multiple channels. Agents never communicate directly with participants or staff — all outbound messages go through this integration.

## MCP Server

```
server: messaging-mcp
```

## Supported Channels

| Channel | Use Case | Configuration Key |
|---|---|---|
| Email | Formal notifications, reports, survey invitations | `MESSAGING_EMAIL_PROVIDER` |
| Slack | Real-time operational alerts for quality team | `MESSAGING_SLACK_WEBHOOK` |
| Microsoft Teams | Organisation-wide notifications | `MESSAGING_TEAMS_WEBHOOK` |
| SMS | Critical escalations to on-duty Quality Monitor | `MESSAGING_SMS_PROVIDER` |

The default channel per message type is configured in the `MESSAGING_DEFAULT_CHANNELS` environment variable.

## Recipient Groups

Pre-defined recipient groups used across agents and hooks:

| Group ID | Members | Used For |
|---|---|---|
| `quality_monitor_duty` | Quality Monitor on duty (rotated daily) | Real-time session alerts |
| `quality_team` | All Quality Coordinators + Head of Quality | Escalations, weekly digests |
| `head_of_quality` | Head of Quality only | Critical escalations, certification decisions |
| `program_director` | Assigned Program Director | Program-level decisions, No-Go alerts |
| `trainer` | Assigned trainer(s) for the program | Pre-delivery briefing, session summaries, feedback |
| `participants` | Session registrants (from LMS roster) | Survey invitations, completion confirmations |
| `client` | External sponsor / client contact (if configured) | Executive report distribution |

## Common Operations

### Send an alert

```json
{
  "tool": "messaging_send",
  "to": "quality_monitor_duty",
  "channel": "slack",
  "priority": "HIGH | NORMAL | LOW",
  "subject": "<alert subject>",
  "body": "<message body — markdown supported>",
  "metadata": {
    "program_id": "<UUID>",
    "session_id": "<UUID>",
    "event_type": "<quality event type>"
  }
}
```

### Send a formatted report

```json
{
  "tool": "messaging_send",
  "to": ["head_of_quality", "program_director"],
  "channel": "email",
  "priority": "NORMAL",
  "subject": "Quality Report — [Program Title]",
  "body": "<markdown report body>",
  "attachments": [{"filename": "quality_report.pdf", "content_base64": "<...>"}]
}
```

### Send a survey invitation

```json
{
  "tool": "messaging_send",
  "to": "participants",
  "channel": "email",
  "priority": "NORMAL",
  "subject": "Your feedback matters — [Program Title] Session [N]",
  "body": "<survey invitation with personalised link>",
  "template": "survey_invitation",
  "merge_fields": {
    "survey_url": "<URL>",
    "session_date": "<DD Month YYYY>",
    "response_deadline": "<DD Month YYYY>"
  }
}
```

### Escalate a critical issue

```json
{
  "tool": "messaging_escalate",
  "to": ["head_of_quality", "program_director"],
  "channels": ["email", "sms"],
  "priority": "CRITICAL",
  "subject": "URGENT: Quality Issue — [Program Title]",
  "body": "<issue description with context>",
  "requires_acknowledgement": true,
  "acknowledge_within_minutes": 30
}
```

## Message Priority Handling

| Priority | Channels Used | Delivery Target |
|---|---|---|
| CRITICAL | Email + SMS + Slack/Teams | Immediate |
| HIGH | Email + Slack/Teams | Within 15 minutes |
| NORMAL | Email | Within 1 hour |
| LOW | Email (digest) | Next business day digest |

## Message Templates

Pre-built templates (referenced by `template` field):

| Template ID | Subject | Used By |
|---|---|---|
| `survey_invitation` | Post-session feedback request | after_session hook |
| `survey_reminder` | Feedback reminder | Post-Delivery Review Agent |
| `session_summary_trainer` | Post-session trainer summary | after_session hook |
| `program_completion` | Program quality review initiated | after_program_completion hook |
| `intake_blocked` | Program approval blocked | before_program_approval hook |
| `no_go_decision` | Program delivery suspended | Pre-Delivery Audit Agent |
| `certification_issued` | Quality certification notification | Quality Decision Agent |
| `improvement_directive` | Action plan assigned | Quality Decision Agent |

## Audit Log

Every message sent via this integration is logged to Google Sheets (`integrations/google_sheets_mcp.md`) in a `MessagingLog` sheet with: timestamp, recipient group, channel, priority, subject, and delivery status.

## Error Handling

- Failed sends are retried up to 3 times with 30-second intervals.
- On persistent failure, the error is written to the Google Sheets `MessagingLog` with status `FAILED` and the calling agent is notified.
- `CRITICAL` messages that cannot be delivered after 3 retries are escalated to a fallback email address configured in `MESSAGING_FALLBACK_EMAIL`.

## Environment Variables Required

```
MESSAGING_EMAIL_PROVIDER=sendgrid | ses | smtp
MESSAGING_EMAIL_FROM=quality@academy.com
MESSAGING_SLACK_WEBHOOK=<webhook URL>
MESSAGING_TEAMS_WEBHOOK=<webhook URL>
MESSAGING_SMS_PROVIDER=twilio | vonage
MESSAGING_FALLBACK_EMAIL=fallback@academy.com
MESSAGING_DEFAULT_CHANNELS={"HIGH": ["email","slack"], "NORMAL": ["email"], "LOW": ["email"]}
```
