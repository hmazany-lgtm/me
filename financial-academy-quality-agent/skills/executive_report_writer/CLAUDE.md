# Skill: Executive Report Writer

## Purpose

Transforms quality decision data and evidence summaries into a polished, audience-appropriate executive report that is ready for distribution to senior stakeholders.

## Invocation

```
skill: executive_report_writer
args:
  program_id: <UUID>
  quality_decision: <quality_decision_agent output object>
  post_delivery_summary: <post_delivery_review output object>
  template: "templates/executive_report_template.md"
  audience: "head_of_quality | program_director | trainer | client"
  format: "markdown | pdf | google_doc"
```

## Audience Variants

The skill tailors content depth and tone to the specified audience:

| Audience | Focus | Tone | Detail Level |
|---|---|---|---|
| `head_of_quality` | All dimensions; systemic patterns; risk flags | Analytical | Full |
| `program_director` | Program score; participant outcomes; improvement plan | Balanced | Summary + key details |
| `trainer` | Trainer-dimension scores; participant feedback themes; specific recommendations | Developmental | Constructive |
| `client` | Overall certification status; satisfaction scores; outcomes vs objectives | Professional | High-level |

## Report Sections

### 1. Executive Summary
- Program name, code, and delivery dates
- Composite quality score and band (with visual indicator)
- Certification decision
- One-paragraph narrative summary (3–5 sentences)

### 2. Quality Scorecard
Table of the five dimensions with scores, weights, and weighted contributions. Visual RAG (Red/Amber/Green) status per dimension:
- Green: dimension score ≥ 75
- Amber: 60–74
- Red: < 60

### 3. Participant Experience
- Attendance and completion rates
- Satisfaction mean and NPS with benchmark comparison (academy average for this program type)
- Top 3 positive themes from open text
- Top 3 improvement themes from open text (framed constructively)

### 4. Learning Outcomes
- Assessment pass rate vs. program target
- Competency gain narrative (from outcome alignment score)
- Notable assessment insights (difficult questions, reliability)

### 5. Trainer Performance
- Trainer delivery score with commentary
- Standout strengths (from recording spot-check and feedback)
- Development focus areas

### 6. Improvement Directives
Structured table of all improvement actions:

| # | Dimension | Finding | Recommendation | Owner | Due Date | Priority |
|---|---|---|---|---|---|---|
| 1 | … | … | … | … | … | HIGH/MED/LOW |

### 7. Historical Trend (if repeat delivery)
- Score delta vs. prior delivery
- Trend narrative
- Actions from prior delivery: resolved / outstanding

### 8. Appendix
- Pre-delivery audit summary
- Session-by-session quality events log
- Raw score calculation audit trail (for internal audiences only)

## Writing Guidelines

- Use plain English; avoid jargon except where technically necessary.
- Frame all feedback constructively: findings → evidence → recommendation.
- Do not name individual participants in any section.
- Scores are reported to one decimal place.
- All percentages are rounded to the nearest whole number.
- Dates in DD Month YYYY format.

## Output

Returns the completed report as:
- **markdown**: Full markdown text ready for rendering.
- **pdf**: Base64-encoded PDF (requires PDF rendering integration).
- **google_doc**: Google Docs URL (requires `integrations/google_sheets_mcp.md` with Docs scope).

```json
{
  "program_id": "<UUID>",
  "audience": "<audience>",
  "format": "<format>",
  "report_content": "<markdown text | base64 PDF | Google Doc URL>",
  "word_count": <int>,
  "generated_at": "<ISO-8601>"
}
```
