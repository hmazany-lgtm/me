# Financial Academy Quality Agent System

## Purpose

This system provides end-to-end quality assurance for financial training programs delivered by the academy. It coordinates a pipeline of specialised agents that evaluate every program from initial intake through live delivery to post-completion review, culminating in an executive quality report.

## System Architecture

```
Program Submission
       │
       ▼
┌─────────────────────┐
│  Program Intake     │  ← intake validation, compliance check, routing
│  Agent              │
└────────┬────────────┘
         │  approved draft
         ▼
┌─────────────────────┐
│  Pre-Delivery       │  ← materials audit, trainer credentials, tech check
│  Audit Agent        │
└────────┬────────────┘
         │  go/no-go decision
         ▼
┌─────────────────────┐
│  Live Online        │  ← real-time attendance, engagement, issue flagging
│  Monitoring Agent   │
└────────┬────────────┘
         │  session metrics
         ▼
┌─────────────────────┐
│  Post-Delivery      │  ← feedback analysis, recording review, NPS
│  Review Agent       │
└────────┬────────────┘
         │  quality data package
         ▼
┌─────────────────────┐
│  Quality Decision   │  ← scoring, certification, improvement directives
│  Agent              │
└─────────────────────┘
```

## Agents

| Agent | File | Responsibility |
|---|---|---|
| Program Intake | `agents/program_intake_agent.md` | Validates and routes new program submissions |
| Pre-Delivery Audit | `agents/pre_delivery_audit_agent.md` | Audits materials and readiness before delivery |
| Live Online Monitoring | `agents/live_online_monitoring_agent.md` | Monitors sessions in real time |
| Post-Delivery Review | `agents/post_delivery_review_agent.md` | Evaluates outcomes after delivery |
| Quality Decision | `agents/quality_decision_agent.md` | Produces scores, decisions, and reports |

## Skills

| Skill | Path | Used By |
|---|---|---|
| Training Program Quality Auditor | `skills/training_program_quality_auditor/` | Pre-Delivery Audit Agent |
| Online Session Monitor | `skills/online_session_monitor/` | Live Online Monitoring Agent |
| Post-Delivery Evaluator | `skills/post_delivery_evaluator/` | Post-Delivery Review Agent |
| Quality Score Calculator | `skills/quality_score_calculator/` | Quality Decision Agent |
| Executive Report Writer | `skills/executive_report_writer/` | Quality Decision Agent |

## Hooks

| Hook | Trigger |
|---|---|
| `hooks/before_program_approval.md` | Before the intake agent approves a program |
| `hooks/before_online_session.md` | Before a live session begins |
| `hooks/after_session.md` | Immediately after a session ends |
| `hooks/after_program_completion.md` | After all sessions in a program are complete |

## Templates

| Template | Purpose |
|---|---|
| `templates/program_input_template.md` | Standard form for submitting a new program |
| `templates/live_monitoring_template.md` | Real-time session observation log |
| `templates/post_delivery_template.md` | Post-delivery data collection form |
| `templates/executive_report_template.md` | Final quality report for leadership |

## Integrations

| Integration | Purpose |
|---|---|
| `integrations/google_sheets_mcp.md` | Quality data storage and dashboards |
| `integrations/calendar_mcp.md` | Session scheduling and reminders |
| `integrations/messaging_mcp.md` | Stakeholder alerts and notifications |
| `integrations/lms_attendance_mcp.md` | Attendance and completion tracking |

## Quality Scoring Model

| Dimension | Weight |
|---|---|
| Content Accuracy & Compliance | 30% |
| Trainer Competence & Delivery | 25% |
| Participant Engagement & Satisfaction | 25% |
| Technical & Logistical Execution | 10% |
| Post-Delivery Outcomes | 10% |

Scores are calculated by the `quality_score_calculator` skill and range 0–100.

| Band | Score | Outcome |
|---|---|---|
| Excellent | 90–100 | Certified; fast-tracked for repeat delivery |
| Good | 75–89 | Certified with minor recommendations |
| Needs Improvement | 60–74 | Conditional approval; action plan required |
| Unsatisfactory | < 60 | Program suspended; full remediation required |

## Conventions

- All agent prompts use the templates in `templates/` for structured input/output.
- Hooks must complete successfully before an agent proceeds to the next stage.
- MCP integrations in `integrations/` are the single source of truth for live data.
- All decisions logged to Google Sheets via `integrations/google_sheets_mcp.md`.
