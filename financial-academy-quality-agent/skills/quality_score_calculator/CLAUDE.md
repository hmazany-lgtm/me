# Skill: Quality Score Calculator

## Purpose

Applies the academy's weighted quality scoring model to a complete evidence package and produces the composite quality score, dimension scores, band assignment, and an audit trail of the calculation.

## Invocation

```
skill: quality_score_calculator
args:
  program_id: <UUID>
  evidence:
    pre_delivery_audit: <pre_delivery_audit output object>
    live_monitoring: <live_monitoring output object>
    post_delivery_review: <post_delivery_review output object>
  prior_score: <float or null>   # composite score from previous delivery, if any
```

## Scoring Model

### Dimension 1: Content Accuracy & Compliance (weight: 30%)

Source fields:
- `pre_delivery_audit.materials_score` (from `training_program_quality_auditor` skill) → 70% of dimension
- `post_delivery_review.content_accuracy_score` (from recording spot-check) → 30% of dimension

Calculation:
```
d1 = (pre_delivery_audit.materials_score × 0.70) + (post_delivery_review.content_accuracy_score × 0.30)
```

### Dimension 2: Trainer Competence & Delivery (weight: 25%)

Source fields:
- `pre_delivery_audit.checklist_summary` trainer readiness items → 20% of dimension
- `post_delivery_review.trainer_performance_score` → 80% of dimension

Calculation:
```
trainer_readiness = (pre_delivery_audit.checklist_summary.trainer_items_passed / total_trainer_items) × 100
d2 = (trainer_readiness × 0.20) + (post_delivery_review.trainer_performance_score × 0.80)
```

### Dimension 3: Participant Engagement & Satisfaction (weight: 25%)

Source fields:
- `live_monitoring.engagement_score` → 40% of dimension
- `post_delivery_review.satisfaction.mean_score` (normalised to 0–100) → 40% of dimension
- `post_delivery_review.satisfaction.nps` (normalised: (nps + 100) / 2) → 20% of dimension

Calculation:
```
nps_normalised = (post_delivery_review.satisfaction.nps + 100) / 2
sat_normalised = post_delivery_review.satisfaction.mean_score × 20   # assumes 5-point scale → ×20 for 100-pt
d3 = (live_monitoring.engagement_score × 0.40) + (sat_normalised × 0.40) + (nps_normalised × 0.20)
```

### Dimension 4: Technical & Logistical Execution (weight: 10%)

Source fields:
- `pre_delivery_audit.checklist_summary` technical items → 50% of dimension
- `live_monitoring.quality_events` (deduct 5 pts per CRITICAL event, 2 pts per WARNING, from 100) → 50% of dimension

Calculation:
```
tech_readiness = (pre_delivery_audit.checklist_summary.tech_items_passed / total_tech_items) × 100
tech_delivery = max(0, 100 - (critical_events × 5) - (warning_events × 2))
d4 = (tech_readiness × 0.50) + (tech_delivery × 0.50)
```

### Dimension 5: Post-Delivery Outcomes (weight: 10%)

Source fields:
- `post_delivery_review.assessment.pass_rate_pct` → 50% of dimension
- `post_delivery_review.outcome_alignment_score` → 50% of dimension

Calculation:
```
d5 = (post_delivery_review.assessment.pass_rate_pct × 0.50) + (post_delivery_review.outcome_alignment_score × 0.50)
```

### Composite Score

```
composite = (d1 × 0.30) + (d2 × 0.25) + (d3 × 0.25) + (d4 × 0.10) + (d5 × 0.10)
```

All intermediate values are clamped to [0, 100] before weighting.

## Band Assignment

| Band | Score Range |
|---|---|
| EXCELLENT | 90–100 |
| GOOD | 75–89 |
| NEEDS_IMPROVEMENT | 60–74 |
| UNSATISFACTORY | 0–59 |

## Output

```json
{
  "program_id": "<UUID>",
  "composite_score": <float, 2 dp>,
  "quality_band": "EXCELLENT | GOOD | NEEDS_IMPROVEMENT | UNSATISFACTORY",
  "dimension_scores": {
    "content_accuracy_compliance": <float>,
    "trainer_competence_delivery": <float>,
    "engagement_satisfaction": <float>,
    "technical_logistical": <float>,
    "post_delivery_outcomes": <float>
  },
  "score_delta_vs_prior": <float or null>,
  "trend": "IMPROVED | STABLE | DECLINED | FIRST_DELIVERY",
  "calculation_audit": {
    "inputs_used": {},
    "intermediate_values": {},
    "formula_version": "1.0"
  },
  "calculated_at": "<ISO-8601>"
}
```

## Notes

- `score_delta_vs_prior` is positive when this delivery scores higher than the prior delivery.
- Trend is IMPROVED if delta > +2, DECLINED if delta < -2, STABLE otherwise.
- The `calculation_audit` object preserves all inputs and intermediate values for traceability and appeals.
- Formula version must be logged so that scores across periods remain comparable if the model changes.
