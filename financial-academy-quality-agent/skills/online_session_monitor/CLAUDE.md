# Skill: Online Session Monitor

## Purpose

Analyses live data streams from an online training session to produce per-window engagement metrics, quality event detection, and end-of-session evidence packages across all six monitoring categories. Called continuously by the Live Online Monitoring Agent throughout each session day.

## Invocation

```
skill: online_session_monitor
args:
  session_id: <UUID>
  program_id: <UUID>
  platform: "zoom" | "teams" | "webex" | "custom"
  event_stream: <live or batched event payload>
  window_minutes: 10         # analysis window size (default 10)
  mode: "window" | "summary" # "window" during session; "summary" at session end
  approved_agenda: <session agenda object from calendar_mcp>
```

---

## Data Sources

Normalised event schema consumed from the platform adapter:

```json
{
  "event_type": "join | leave | chat | poll_launch | poll_response | reaction | raise_hand | answer_given | camera_on | camera_off | screen_share_start | screen_share_end | breakout_start | breakout_end | audio_issue | video_issue | platform_error",
  "participant_id": "<anonymised ID>",
  "trainer_event": true | false,
  "timestamp": "<ISO-8601>",
  "payload": {}
}
```

---

## Mode 1: Window Analysis (every 10 minutes during session)

### Category 3 — Learner Engagement Metrics

#### Active Participation Rate
Percentage of registered participants who performed at least one interactive action (chat, poll response, reaction, raise hand) in the current 10-minute window.

| Level | Rate |
|---|---|
| Excellent | ≥ 70% |
| Good | 50–69% |
| Low | 30–49% |
| Critical | < 30% — triggers escalation rule E1 check |

#### Chat Vitality Index
Messages per participant per window, normalised 0–100:
```
chat_vitality = min(100, (chat_messages / registered_participants) × 50)
```

#### Poll Participation Rate
Percentage of participants who responded to each poll launched in the window. If no poll was launched: flag if a poll was scheduled per the approved agenda but not executed (`POLL_SKIPPED` event).

#### Q&A Engagement Score
```
qa_score = min(100, (questions_asked / registered_participants) × 100 +
                    (questions_answered / max(questions_asked, 1)) × 50)
```

#### Camera Presence (where available)
`camera_on_pct = cameras_on / registered_participants × 100`
Used as an attention proxy. Flagged if it drops > 30% from the opening baseline. Not scored on platforms that do not expose camera state.

#### Breakout Effectiveness (during breakout windows)
Rated by: breakout launched on schedule, all rooms active, report-back completed.
- Effective: all three ✓
- Partial: 1–2 ✓
- Ineffective: none ✓ — logs `BREAKOUT_FAILED` event

#### Drop-Off Signs
Monitor and flag: participant count declining trend, camera-off surge, extended chat silence (> 15 consecutive minutes), reaction rate collapse.

#### Window Engagement Score
```
window_engagement = (
  0.35 × active_participation_rate_normalised +
  0.25 × chat_vitality_index +
  0.25 × poll_participation_rate_normalised +
  0.15 × qa_score_normalised
)
```
Score range: 0–100.

### Quality Event Detection (all categories)

The skill emits timestamped quality events that feed the monitoring log:

| Category | Event Type | Trigger Condition |
|---|---|---|
| C1 Session Design | `LONG_PASSIVE_BLOCK` | No trainer interaction event for > 30 minutes |
| C1 Session Design | `FATIGUE_RISK` | Passive block > 40 min OR participant count drops > 25% from peak |
| C2 Trainer Delivery | `NO_INTERACTION_BLOCK` | Zero participant interaction events in a 20-minute window |
| C2 Trainer Delivery | `PACING_DEVIATION` | Module runtime deviates > 15% from agenda |
| C3 Learner Engagement | `LOW_ENGAGEMENT` | Active participation < 30% for a full window |
| C3 Learner Engagement | `SILENT_PERIOD` | Zero chat messages for 15 consecutive minutes |
| C3 Learner Engagement | `POLL_SKIPPED` | Scheduled poll not launched within 5 min of agenda time |
| C3 Learner Engagement | `ATTENTION_DROP` | Camera-on rate drops > 30% from opening baseline |
| C4 Online Experience | `TECHNICAL_WARNING` | Audio/video quality degradation; participant reports access issue |
| C4 Online Experience | `TECHNICAL_CRITICAL` | Platform error; audio/video failure > 2 minutes; host disconnected |
| C5 Instructional | `NO_COMPREHENSION_CHECK` | > 30 minutes since last poll, open question, or worked example |
| C6 Operations | `LATE_START` | Session starts > 5 minutes after scheduled time |
| C6 Operations | `OVERTIME` | Session clock exceeds scheduled end by > 10 minutes |
| C6 Operations | `RECORDING_ISSUE` | Recording not active when expected |

**Severity Classification**

| Severity | Definition | Triggers Escalation? |
|---|---|---|
| CRITICAL | Immediate impact on learning or access | Yes — alert Quality Monitor immediately |
| WARNING | Degraded quality; no immediate learning failure | Log; include in summary |
| INFO | Observation for record; no action required | Log only |

### Escalation Rule Checks (per window)

After each window analysis, evaluate:

| Rule | Check |
|---|---|
| E1 | `active_participation_rate < 30%` for this AND prior window |
| E2 | `NO_INTERACTION_BLOCK` event detected |
| E3 | `TECHNICAL_CRITICAL` event count in session ≥ 2, or cumulative downtime > 10 min |
| E4 | `FATIGUE_RISK` event emitted OR participant count drop > 25% from peak |
| E5 | `NO_COMPREHENSION_CHECK` event emitted AND session elapsed > 50% of scheduled duration |

If any rule is triggered, return `escalation_required: true` with the rule number and evidence. The agent handles the escalation action.

### Window Output

```json
{
  "session_id": "<UUID>",
  "window_number": <int>,
  "window_start": "<ISO-8601>",
  "window_end": "<ISO-8601>",
  "participants_registered": <int>,
  "participants_active": <int>,
  "active_participation_rate_pct": <float>,
  "chat_vitality_index": 0-100,
  "poll_participation_rate_pct": <float or null>,
  "qa_engagement_score": 0-100,
  "camera_on_pct": <float or null>,
  "window_engagement_score": 0-100,
  "quality_events": [
    {"category": "C1–C6", "type": "<event type>", "severity": "CRITICAL | WARNING | INFO", "detail": "<description>"}
  ],
  "escalation_check": {
    "escalation_required": true | false,
    "rules_triggered": ["E1", "E3"],
    "evidence": "<supporting data>"
  }
}
```

---

## Mode 2: Session Summary (called once at session end)

Aggregates all window outputs and produces the evidence package the agent uses to:
- Score all 6 categories (1–5)
- Compute the Live Delivery Score
- Write the four required output sections

### Session-Level Aggregations

**Engagement summary**:
```
mean_engagement_score     = mean of all window_engagement_scores
peak_engagement_score     = max window_engagement_score
trough_engagement_score   = min window_engagement_score
engagement_trend          = linear regression slope across windows (positive / flat / declining)
total_polls_scheduled     = from approved agenda
total_polls_launched      = count of poll_launch events
total_polls_skipped       = total_polls_scheduled - total_polls_launched
```

**Trainer delivery summary**:
```
pacing_deviation_count    = count of PACING_DEVIATION events
no_interaction_blocks     = count of NO_INTERACTION_BLOCK events (20-min blocks)
long_passive_blocks       = count of LONG_PASSIVE_BLOCK events
comprehension_checks      = count of poll_launch + raise_hand answered + open question logged
```

**Technical summary**:
```
technical_critical_count  = count of TECHNICAL_CRITICAL events
technical_warning_count   = count of TECHNICAL_WARNING events
total_downtime_minutes    = sum of technical failure durations
recording_active_pct      = % of session with recording confirmed active
```

**Operational summary**:
```
start_delay_minutes       = actual start - scheduled start (0 if on time)
end_deviation_minutes     = actual end - scheduled end (positive = overrun)
attendance_tracked        = TRUE | FALSE
session_closure_quality   = "COMPLETE" | "RUSHED" | "ABSENT"
```

### Category Evidence Packages

The skill produces an evidence summary per category that the agent uses to justify its 1–5 score:

```json
{
  "C1_session_design": {
    "long_passive_block_count": <int>,
    "fatigue_risk_events": <int>,
    "agenda_visible_at_start": true | false,
    "activity_frequency_per_hour": <float>,
    "evidence_summary": "<2-3 sentence factual summary>"
  },
  "C2_trainer_delivery": {
    "no_interaction_block_count": <int>,
    "pacing_deviation_count": <int>,
    "trainer_interaction_events": <int>,
    "evidence_summary": "<2-3 sentence factual summary>"
  },
  "C3_learner_engagement": {
    "mean_engagement_score": 0-100,
    "trough_engagement_score": 0-100,
    "engagement_trend": "positive | flat | declining",
    "polls_skipped": <int>,
    "silent_periods": <int>,
    "attention_drop_events": <int>,
    "drop_off_participant_count": <int>,
    "evidence_summary": "<2-3 sentence factual summary>"
  },
  "C4_online_experience": {
    "technical_critical_count": <int>,
    "technical_warning_count": <int>,
    "total_downtime_minutes": <float>,
    "audio_video_quality": "GOOD | ACCEPTABLE | POOR",
    "evidence_summary": "<2-3 sentence factual summary>"
  },
  "C5_instructional_effectiveness": {
    "comprehension_checks_count": <int>,
    "no_comprehension_check_periods": <int>,
    "practical_examples_logged": <int>,
    "evidence_summary": "<2-3 sentence factual summary>"
  },
  "C6_operational_quality": {
    "start_delay_minutes": <float>,
    "end_deviation_minutes": <float>,
    "attendance_tracked": true | false,
    "recording_status": "ACTIVE | FAILED | NOT_CONFIGURED",
    "session_closure_quality": "COMPLETE | RUSHED | ABSENT",
    "evidence_summary": "<2-3 sentence factual summary>"
  }
}
```

### Session Summary Output

```json
{
  "session_id": "<UUID>",
  "session_date": "<YYYY-MM-DD>",
  "windows_analysed": <int>,
  "attendance": {
    "registered": <int>,
    "peak_concurrent": <int>,
    "completed": <int>,
    "completion_rate_pct": <float>
  },
  "engagement_summary": { ... },
  "trainer_delivery_summary": { ... },
  "technical_summary": { ... },
  "operational_summary": { ... },
  "category_evidence": { ... },
  "all_quality_events": [ ... ],
  "escalations_triggered": [ ... ],
  "session_status": "MONITORING_COMPLETE"
}
```

---

## Notes

- Participant IDs are anonymised throughout; the skill never stores personally identifiable information.
- Platform-specific adapters normalise events to the standard schema before this skill is invoked.
- In window mode the skill is stateless; the Live Online Monitoring Agent accumulates session-level state.
- `NO_COMPREHENSION_CHECK` events rely on trainer activity logging (poll launches, open question annotations). If the platform does not expose this, the agent must supplement with manual observation notes.
