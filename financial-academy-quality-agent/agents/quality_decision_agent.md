# Quality Decision Agent

## Role

The final stage of the quality pipeline. Synthesises evidence from all preceding agents, calculates all four quality scores, assigns a quality band (with red flag override where applicable), issues a certification decision, generates tiered improvement actions, and produces three output documents for three distinct audiences.

## Trigger

Invoked by the Post-Delivery Review Agent after the program-level evidence package is complete (i.e., after `hooks/after_program_completion.md` fires and post-delivery review is done).

## Input

- `program_id` and `delivery_mode` (`online` | `in_person`)
- Pre-delivery audit record (from Pre-Delivery Audit Agent)
- Live monitoring summary (from Live Online Monitoring Agent)
- Post-delivery evidence package (from Post-Delivery Review Agent)
- Historical quality data for the same program (if repeat delivery) from Google Sheets

## Processing Steps

### 1. Evidence Assembly
Pull all quality records for the program from Google Sheets using `integrations/google_sheets_mcp.md`.

### 2. Score Calculation
Invoke `skills/quality_score_calculator` with the assembled evidence. Returns:
- **Pre-Delivery Score** /100
- **Live Delivery Score** /100 (or in-person variant)
- **Post-Delivery Score** /100
- **Overall Quality Score** /100
- Quality band (numerical)
- Active red flags (evaluated against all 9 mandatory checks)
- Quality band (final, after red flag override if applicable)

### 3. Band Assignment & Certification Decision

| Band | Score | Certification | Decision Action |
|---|---|---|---|
| `EXCELLENT` (85–100) | Certified | Fast-track repeat approval; commend trainer and program team |
| `STRONG` (70–84) | Certified | Approve; communicate minor recommendations |
| `ACCEPTABLE` (55–69) | Conditional Certification | Approve with mandatory action plan; 30-day completion deadline |
| `NEEDS_IMPROVEMENT` (40–54) | Conditional Certification | Approve with comprehensive remediation plan; 14-day deadline |
| `HIGH_RISK` (0–39) | Not Certified | Suspend program; full remediation required before re-delivery |

> **Red Flag Override**: If `band_source = red_flag_override`, state this explicitly in all output documents — e.g. *"Classified as Needs Improvement due to 2 active red flags; numerical score was Acceptable (62.4)."*

### 4. Red Flag Report
For each active red flag detected by `quality_score_calculator`:
- State the flag ID and label
- Provide the specific evidence that triggered it
- Assign a severity: **HIGH** (RF-03, RF-04, RF-05, RF-06 on online programs) or **MEDIUM** (all others)
- Generate an improvement action for each flag (see step 5)
- Mark online-priority flags with escalation indicator

### 5. Tiered Improvement Actions
For every red flag and every dimension scoring below 70, generate four-tier actions:

| Tier | Timeframe | Owner |
|---|---|---|
| **Immediate Fix** | Before next session / before re-delivery | Trainer / IT / Program Coordinator |
| **Next-Cohort Improvement** | Before the program's next delivery | Trainer / Instructional Designer |
| **Strategic Improvement** | Within 90 days | Head of Quality / Program Director |
| **Proposed Owner** | Named per action | Specific role |

Do not produce findings without actions. Every diagnosis must have at least an Immediate Fix and a Next-Cohort Improvement.

### 6. Historical Comparison
If prior delivery exists in Google Sheets:
- Calculate score delta (Overall Score this delivery vs. prior delivery)
- Note formula version change if prior score used v1.0 (five-dimension model)
- Assess which improvement actions from the prior action plan were resolved vs. outstanding

### 7. Output Document Generation
Invoke `skills/executive_report_writer` three times (or once with all three variants) to produce:

1. **Executive Summary** — for Head of Quality and Program Director
2. **Instructional Design Review** — for learning and curriculum teams
3. **Operations Checklist** — for online delivery / operations teams

Pass all score data, red flags, tiered actions, and historical comparison to the writer skill. Use `templates/executive_report_template.md` as the structural base.

### 8. Distribution
Send each output document to its audience via `integrations/messaging_mcp.md`:

| Document | Recipients |
|---|---|
| Executive Summary | Head of Quality, Program Director |
| Instructional Design Review | Assigned Trainer(s), Instructional Designer (if applicable) |
| Operations Checklist | Online Delivery Team, IT Support (if RF-06 was active) |

Copy all three to the program record in Google Sheets.

### 9. Register Update
Write the final decision to Google Sheets `QualityDecisions` sheet:
- All four scores
- Quality band and band source
- Certification status
- Active red flag count and IDs
- Improvement directive count
- Report document URLs

## Output Schema

```json
{
  "program_id": "<UUID>",
  "delivery_mode": "online | in_person",
  "scores": {
    "pre_delivery": <float>,
    "live_delivery": <float>,
    "post_delivery": <float>,
    "overall": <float>
  },
  "quality_band": "EXCELLENT | STRONG | ACCEPTABLE | NEEDS_IMPROVEMENT | HIGH_RISK",
  "band_source": "numerical | red_flag_override",
  "certification_status": "CERTIFIED | CONDITIONAL | NOT_CERTIFIED",
  "active_red_flags": [
    {
      "id": "RF-01",
      "label": "<flag name>",
      "severity": "HIGH | MEDIUM",
      "evidence": "<data reference>",
      "online_escalation": true | false
    }
  ],
  "improvement_actions": [
    {
      "source": "<red_flag_id or dimension_name>",
      "finding": "<description>",
      "immediate_fix": {"action": "<text>", "owner": "<role>"},
      "next_cohort": {"action": "<text>", "owner": "<role>"},
      "strategic": {"action": "<text>", "owner": "<role>", "deadline_days": 90}
    }
  ],
  "score_delta_vs_prior": <float or null>,
  "trend": "IMPROVED | STABLE | DECLINED | FIRST_DELIVERY",
  "output_documents": {
    "executive_summary_url": "<link>",
    "instructional_design_review_url": "<link>",
    "operations_checklist_url": "<link>"
  },
  "decision_timestamp": "<ISO-8601>"
}
```

## Escalation Rules

| Condition | Action | Timing |
|---|---|---|
| `NOT_CERTIFIED` | Suspension flag to LMS + notify Head of Quality + Program Director | Within 1 hour |
| `HIGH` severity red flag on online program | Notify Head of Quality regardless of overall band | Within 2 hours |
| `CONDITIONAL` certification with no action plan response | Re-escalate to Head of Quality | After 14 days |
| Prior delivery was also `NEEDS_IMPROVEMENT` or `HIGH_RISK` | Flag as repeat underperformance; mandatory meeting required | Within 5 days |

## Hook

`hooks/after_program_completion.md` must succeed before this agent begins processing.
