# Skill: Quality Score Calculator

## Purpose

Applies the academy's three-stage quality scoring model to a complete evidence package. Produces four scores (Pre-Delivery, Live Delivery, Post-Delivery, Overall), assigns a quality band, detects mandatory red flags, and logs a full calculation audit trail.

## Invocation

```
skill: quality_score_calculator
args:
  program_id: <UUID>
  delivery_mode: "online" | "in_person"
  evidence:
    pre_delivery_audit: <pre_delivery_audit output object>
    live_monitoring: <live_monitoring output object or null>
    post_delivery_review: <post_delivery_review output object>
  prior_score: <float or null>   # Overall score from previous delivery, if any
```

---

## Stage 1: Pre-Delivery Score (0–100)

### Dimension 1A: Instructional Design Quality (weight: 40%)

Source fields:
- `pre_delivery_audit.materials_score` → `learning_objective_alignment` sub-score (from `training_program_quality_auditor` skill dimension 2)
- New checks run at audit time:
  - Objectives are specific, measurable, and achievable: 0–25 pts
  - Content modules follow a logical scaffolded sequence: 0–25 pts
  - At least one learner activity per 30 minutes of content: 0–25 pts
  - Assessment questions map directly to stated objectives (≥ 80% coverage): 0–25 pts

```
d_instructional = (objectives_score + sequencing_score + activity_design_score + assessment_alignment_score) / 4
```

### Dimension 1B: Content Accuracy & Compliance (weight: 35%)

Source fields:
- `pre_delivery_audit.materials_score` → `content_accuracy_currency` sub-score (dimension 1, max 30 pts → normalise to 100)
- `pre_delivery_audit.materials_score` → `regulatory_compliance_language` sub-score (dimension 3, max 25 pts → normalise to 100)

```
accuracy_normalised   = (content_accuracy_currency_pts / 30) × 100
compliance_normalised = (regulatory_compliance_pts / 25) × 100
d_content = (accuracy_normalised × 0.55) + (compliance_normalised × 0.45)
```

### Dimension 1C: Technical & Delivery Readiness (weight: 25%)

Source fields:
- `pre_delivery_audit.checklist_summary.trainer_items_passed / trainer_items_total` → normalise to 100
- `pre_delivery_audit.checklist_summary.tech_items_passed / tech_items_total` → normalise to 100 (0 if in-person and not applicable)
- `pre_delivery_audit.checklist_summary.materials_items_passed / materials_items_total` → normalise to 100

```
trainer_readiness  = (trainer_items_passed / trainer_items_total) × 100
tech_readiness     = (tech_items_passed / tech_items_total) × 100   # 100 if in-person (no tech check required)
materials_readiness = (materials_items_passed / materials_items_total) × 100
d_readiness = (trainer_readiness × 0.40) + (tech_readiness × 0.30) + (materials_readiness × 0.30)
```

### Pre-Delivery Score

```
pre_delivery_score = (d_instructional × 0.40) + (d_content × 0.35) + (d_readiness × 0.25)
```

---

## Stage 2: Live Delivery Score (0–100)

**Online programs only.** For in-person programs, this score is derived from trainer observation and attendance data only (see in-person note below).

### Dimension 2A: Learner Engagement (weight: 45%)

Source: `live_monitoring.engagement_score` (0–100, produced by `online_session_monitor` skill).

For multi-day programs, use the session-weighted mean:
```
d_engagement = weighted_mean(session_engagement_scores, weights=attendance_counts)
```

### Dimension 2B: Trainer Facilitation Quality (weight: 35%)

Source fields:
- `live_monitoring.quality_events` — count of `PACING` and `CONTENT` events
- Trainer pacing adherence score: `max(0, 100 - (pacing_flag_count × 10))`
- Facilitation interaction score: based on whether polls, Q&A, and activities were used as designed
  - All planned interactions executed: 100
  - 50–99% executed: 70
  - < 50% executed: 40
  - None executed (trainer-centred only): 10

```
pacing_score     = max(0, 100 - (pacing_event_count × 10))
interaction_score = <derived from activity execution rate above>
d_facilitation   = (pacing_score × 0.40) + (interaction_score × 0.60)
```

### Dimension 2C: Technical Execution (weight: 20%)

Source: `live_monitoring.quality_events` filtered to `TECHNICAL` type.

```
tech_score = max(0, 100 - (critical_technical_events × 15) - (warning_technical_events × 5))
d_technical = tech_score
```

### Live Delivery Score (Online)

```
live_delivery_score = (d_engagement × 0.45) + (d_facilitation × 0.35) + (d_technical × 0.20)
```

### Live Delivery Score (In-Person)

For in-person programs without live monitoring, derive from available data:

```
trainer_obs_score = post_delivery_review.trainer_performance_score   # from recording or observation
attendance_score  = min(100, live_monitoring.attendance.completion_rate_pct × (100/80))  # 80% target = 100 pts
live_delivery_score = (trainer_obs_score × 0.60) + (attendance_score × 0.40)
```

---

## Stage 3: Post-Delivery Score (0–100)

### Dimension 3A: Assessment & Learning Outcomes (weight: 40%)

Source fields:
- `post_delivery_review.assessment.pass_rate_pct`
- `post_delivery_review.outcome_alignment_score`

```
pass_rate_score    = post_delivery_review.assessment.pass_rate_pct   # already 0–100
alignment_score    = post_delivery_review.outcome_alignment_score
d_outcomes = (pass_rate_score × 0.55) + (alignment_score × 0.45)
```

### Dimension 3B: Learner Satisfaction (weight: 30%)

Source fields:
- `post_delivery_review.satisfaction.mean_score` (1–5 scale → normalise ×20)
- `post_delivery_review.satisfaction.nps` (−100 to +100 → normalise: (nps + 100) / 2)

```
sat_normalised = post_delivery_review.satisfaction.mean_score × 20
nps_normalised = (post_delivery_review.satisfaction.nps + 100) / 2
d_satisfaction = (sat_normalised × 0.65) + (nps_normalised × 0.35)
```

### Dimension 3C: Trainer Performance (weight: 30%)

Source fields:
- `post_delivery_review.trainer_performance_score` (from recording spot-check)
- `post_delivery_review.content_accuracy_score` (recording accuracy check)

```
d_trainer_post = (post_delivery_review.trainer_performance_score × 0.60) +
                 (post_delivery_review.content_accuracy_score × 0.40)
```

### Post-Delivery Score

```
post_delivery_score = (d_outcomes × 0.40) + (d_satisfaction × 0.30) + (d_trainer_post × 0.30)
```

---

## Overall Quality Score

```
Online programs:
  overall_score = (pre_delivery_score × 0.25) + (live_delivery_score × 0.40) + (post_delivery_score × 0.35)

In-person programs:
  overall_score = (pre_delivery_score × 0.35) + (post_delivery_score × 0.65)
```

All intermediate values are clamped to [0, 100] before weighting.

---

## Band Assignment

| Band | Score Range | Certification |
|---|---|---|
| `EXCELLENT` | 85–100 | Certified — accelerated re-approval |
| `STRONG` | 70–84 | Certified |
| `ACCEPTABLE` | 55–69 | Conditional Certification |
| `NEEDS_IMPROVEMENT` | 40–54 | Conditional Certification (mandatory remediation) |
| `HIGH_RISK` | 0–39 | Not Certified |

### Red Flag Override

After the numerical band is assigned, apply the red flag floor:

| Active Red Flags | Minimum Band |
|---|---|
| 0–1 | No floor applied |
| 2–3 | `NEEDS_IMPROVEMENT` (floor) |
| 4+ | `HIGH_RISK` (floor) |

For **online programs**, any single instance of RF-03, RF-04, RF-05, or RF-06 triggers the 2-flag floor logic regardless of total flag count.

---

## Red Flag Detection

Evaluate all nine flags from the evidence. Each flag is `true | false` with a severity and supporting evidence reference.

| Flag | ID | Detection Logic |
|---|---|---|
| Unclear objectives | RF-01 | `d_instructional.objectives_score < 50` |
| Weak content sequencing | RF-02 | `d_instructional.sequencing_score < 50` |
| Passive online delivery | RF-03 | `d_instructional.activity_design_score < 40` OR `interaction_score < 40` |
| Low learner engagement | RF-04 | `live_monitoring.engagement_score < 50` OR any window score < 30 |
| Trainer-centered facilitation | RF-05 | `interaction_score ≤ 10` (no structured interaction) |
| Repeated technical issues | RF-06 | `critical_technical_events ≥ 2` in one session OR CRITICAL in ≥ 2 sessions |
| Weak attendance discipline | RF-07 | `completion_rate_pct < 60` OR `≥ 20%` participants with < 50% daily attendance |
| Poor assessment alignment | RF-08 | `d_instructional.assessment_alignment_score < 60` OR `pass_rate_pct < 55` |
| Weak closure & action transfer | RF-09 | `d_instructional.activity_design_score < 40` in final module AND no transfer activity logged |

---

## Output

```json
{
  "program_id": "<UUID>",
  "delivery_mode": "online | in_person",
  "scores": {
    "pre_delivery": <float, 1 dp>,
    "live_delivery": <float, 1 dp>,
    "post_delivery": <float, 1 dp>,
    "overall": <float, 1 dp>
  },
  "dimension_scores": {
    "instructional_design": <float>,
    "content_accuracy_compliance": <float>,
    "technical_delivery_readiness": <float>,
    "learner_engagement": <float>,
    "trainer_facilitation": <float>,
    "technical_execution": <float>,
    "assessment_outcomes": <float>,
    "learner_satisfaction": <float>,
    "trainer_performance_post": <float>
  },
  "quality_band": "EXCELLENT | STRONG | ACCEPTABLE | NEEDS_IMPROVEMENT | HIGH_RISK",
  "band_source": "numerical | red_flag_override",
  "red_flags": [
    {
      "id": "RF-01",
      "label": "Unclear objectives",
      "active": true | false,
      "severity": "HIGH | MEDIUM",
      "evidence": "<supporting data reference>",
      "online_priority_escalation": true | false
    }
  ],
  "active_red_flag_count": <int>,
  "score_delta_vs_prior": <float or null>,
  "trend": "IMPROVED | STABLE | DECLINED | FIRST_DELIVERY",
  "calculation_audit": {
    "inputs_used": {},
    "intermediate_values": {},
    "formula_version": "2.0",
    "delivery_mode_weights": {}
  },
  "calculated_at": "<ISO-8601>"
}
```

## Notes

- Formula version `2.0` reflects the Pre/Live/Post three-stage model. Prior deliveries scored under version `1.0` (five-dimension flat model) are not directly comparable; note this in the trend narrative.
- `band_source` tells readers whether the band came from the score or from red flag override.
- For in-person programs, `learner_engagement`, `trainer_facilitation`, and `technical_execution` dimension scores are derived from observation and attendance data; RF-03, RF-04, and RF-06 are marked `not_applicable`.
