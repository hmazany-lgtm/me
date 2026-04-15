# Skill: Post-Delivery Evaluator

## Purpose

Analyses qualitative and quantitative post-delivery data — survey responses, assessment results, and session recording segments — to produce structured scores and themes for the Post-Delivery Review Agent.

## Invocation

```
skill: post_delivery_evaluator
args:
  program_id: <UUID>
  session_id: <UUID>           # omit for program-level evaluation
  evaluation_type: "survey | assessment | recording | program_summary"
  data: <structured payload>
```

## Evaluation Modes

### Mode 1: Survey Analysis (`evaluation_type: "survey"`)

**Input**: Array of participant survey responses with Likert-scale ratings and open-text fields.

**Processing**:
1. Calculate mean and median for each rated dimension.
2. Calculate Net Promoter Score from the recommendation question.
3. Run sentiment analysis on open-text responses: classify each response as Positive / Neutral / Negative.
4. Extract recurring themes using frequency analysis (minimum 3 mentions to qualify as a theme).
5. Flag any verbatim responses containing safeguarding, compliance, or conduct concerns for immediate escalation.

**Output**:
```json
{
  "response_count": <int>,
  "dimension_means": {"content_quality": <float>, "trainer_effectiveness": <float>, "pacing": <float>, "relevance": <float>},
  "overall_satisfaction_mean": <float>,
  "nps": <int>,
  "sentiment_distribution": {"positive_pct": <float>, "neutral_pct": <float>, "negative_pct": <float>},
  "top_themes": [{"theme": "<text>", "frequency": <int>, "sentiment": "positive|neutral|negative"}],
  "escalation_flags": ["<verbatim excerpt>"]
}
```

### Mode 2: Assessment Analysis (`evaluation_type: "assessment"`)

**Input**: Array of participant assessment results with per-question scores.

**Processing**:
1. Calculate overall pass rate and mean score.
2. Identify questions with a difficulty index < 0.40 (fewer than 40% answered correctly) as flagged.
3. Identify questions with a difficulty index > 0.95 as potentially too easy.
4. Calculate reliability coefficient (Cronbach's alpha) if ≥ 10 questions.

**Output**:
```json
{
  "participant_count": <int>,
  "pass_rate_pct": <float>,
  "mean_score": <float>,
  "reliability_alpha": <float or null>,
  "flagged_difficult_questions": [{"question_id": "<id>", "difficulty_index": <float>}],
  "flagged_easy_questions": [{"question_id": "<id>", "difficulty_index": <float>}]
}
```

### Mode 3: Recording Spot-Check (`evaluation_type: "recording"`)

**Input**: Recording URL and three timestamp ranges (each 10 minutes) selected by the Post-Delivery Review Agent.

**Processing**:
1. Retrieve and transcribe each segment.
2. Score trainer delivery: clarity, pace, use of examples, responsiveness to questions.
3. Cross-reference content against approved materials: flag deviations, omissions, or additions.
4. Check compliance language: verify required disclosures were stated at appropriate points.

**Output**:
```json
{
  "segments_reviewed": 3,
  "trainer_delivery_score": 0-100,
  "content_accuracy_score": 0-100,
  "compliance_language_score": 0-100,
  "deviations": [{"timestamp": "<HH:MM:SS>", "type": "omission|addition|inaccuracy", "detail": "<description>"}]
}
```

### Mode 4: Program Summary (`evaluation_type: "program_summary"`)

**Input**: All per-session evaluation outputs for the program.

**Processing**:
1. Aggregate all scores with session weighting (weighted by attendance count).
2. Calculate trend slope across sessions for satisfaction, engagement, and assessment.
3. Identify best and worst performing sessions.
4. Summarise top 5 improvement themes across the program.

**Output**:
```json
{
  "sessions_evaluated": <int>,
  "aggregated_satisfaction_mean": <float>,
  "aggregated_nps": <int>,
  "aggregated_pass_rate_pct": <float>,
  "satisfaction_trend": "IMPROVING | STABLE | DECLINING",
  "assessment_trend": "IMPROVING | STABLE | DECLINING",
  "best_session_id": "<UUID>",
  "worst_session_id": "<UUID>",
  "top_improvement_themes": ["<theme>", ...]
}
```
