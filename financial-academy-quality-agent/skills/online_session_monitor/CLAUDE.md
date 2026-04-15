# Skill: Online Session Monitor

## Purpose

Analyses live data streams from an online training session to calculate a real-time engagement score and surface quality events for the Live Online Monitoring Agent.

## Invocation

```
skill: online_session_monitor
args:
  session_id: <UUID>
  platform: <"zoom" | "teams" | "webex" | "custom">
  event_stream: <live or batched event payload>
  window_minutes: 10   # analysis window size (default 10)
```

## Data Sources

The skill consumes structured event data from the session platform, normalised to this schema:

```json
{
  "event_type": "join | leave | chat | poll_response | reaction | raise_hand | camera_on | camera_off | screen_share_start | screen_share_end",
  "participant_id": "<anonymised ID>",
  "timestamp": "<ISO-8601>",
  "payload": {}
}
```

## Engagement Metrics

### Active Participation Rate
Percentage of registered participants who performed at least one interactive action (chat, poll, reaction, raise hand) in the current window.

- Excellent: ≥ 70%
- Good: 50–69%
- Low: 30–49%
- Critical: < 30%

### Chat Vitality Index
Messages per participant per 10-minute window, normalised to a 0–100 score.

### Poll Participation Rate
Percentage of participants who responded to each poll launched.

### Q&A Engagement Score
Ratio of questions asked to participants present; weighted by whether questions were answered.

### Camera Presence (where available)
Percentage of participants with cameras on. Used as a proxy for attention (not scored if platform does not expose this).

## Composite Engagement Score

```
engagement_score = (
  0.35 × active_participation_rate_normalised +
  0.25 × chat_vitality_index +
  0.25 × poll_participation_rate_normalised +
  0.15 × qa_engagement_score_normalised
)
```

Score range: 0–100.

## Quality Event Detection

The skill emits structured quality events when:

| Condition | Event Type |
|---|---|
| Active participation < 30% for a full window | `LOW_ENGAGEMENT` |
| No poll responses for 20+ minutes in a session with ≥ 1 poll scheduled | `POLL_MISSED` |
| Camera drop-off > 40% from session start (where available) | `ATTENTION_DROP` |
| Session clock exceeds scheduled end by > 10 minutes | `OVERTIME` |
| Zero chat messages for 15 consecutive minutes | `SILENT_PERIOD` |

## Output (per window)

```json
{
  "session_id": "<UUID>",
  "window_start": "<ISO-8601>",
  "window_end": "<ISO-8601>",
  "participants_active": <int>,
  "participants_registered": <int>,
  "active_participation_rate_pct": <float>,
  "chat_vitality_index": 0-100,
  "poll_participation_rate_pct": <float>,
  "qa_engagement_score": 0-100,
  "engagement_score": 0-100,
  "quality_events": [
    {"type": "<event type>", "detail": "<description>", "timestamp": "<ISO-8601>"}
  ]
}
```

## Notes

- Participant IDs are anonymised; the skill never stores personally identifiable information.
- Platform-specific adapters handle event normalisation before this skill is invoked.
- The skill is stateless per window; the Live Online Monitoring Agent maintains session-level state.
