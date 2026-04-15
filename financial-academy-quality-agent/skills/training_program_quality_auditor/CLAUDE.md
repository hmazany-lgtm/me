# Skill: Training Program Quality Auditor

## Purpose

Performs a structured quality audit of training materials for financial programs across two layers:

1. **Instructional Design Audit** — scores all 8 review dimensions (1–5 scale) as defined in the Pre-Delivery Audit Agent
2. **Content Integrity Check** — verifies content accuracy, regulatory compliance language, accessibility, and originality (required for all financial programs regardless of instructional quality)

Called by the Pre-Delivery Audit Agent to produce the detailed evidence that feeds both the Pre-Delivery Score and the `quality_score_calculator` sub-scores.

## Invocation

```
skill: training_program_quality_auditor
args:
  program_id: <UUID>
  delivery_mode: "online" | "in_person"
  materials_package: <URL or structured payload>
  regulatory_scope: <e.g. "MiFID II", "FCA", "SAMA", "internal">
  target_audience: <e.g. "retail advisers", "compliance officers", "insurance brokers">
  learning_objectives: [<objective text>, ...]
  session_schedule: <from calendar_mcp>
```

---

## Layer 1: Instructional Design Audit (1–5 per dimension)

Evaluate each of the eight dimensions using the rubric defined in `agents/pre_delivery_audit_agent.md`. For each dimension, produce:
- A score (1–5, half-scores permitted)
- A one-sentence justification
- Specific evidence references (slide number, section title, or module name)
- Any triggered red flags

### Dimension Mapping to Quality Score Calculator Sub-scores

The quality_score_calculator requires specific sub-scores from the instructional design audit. Map dimension scores as follows:

| Calculator Sub-score | Source Dimensions | Mapping |
|---|---|---|
| `objectives_score` | D3 (Objective Quality) + D2 (Target Audience Fit) | `(D3 × 0.70 + D2 × 0.30) / 5 × 100` |
| `sequencing_score` | D4 (Content Sequencing) | `D4 / 5 × 100` |
| `activity_design_score` | D5 (KSB Balance) + D6 (Activity Relevance) | `(D5 × 0.50 + D6 × 0.50) / 5 × 100` |
| `assessment_alignment_score` | D7 (Assessment Alignment) | `D7 / 5 × 100` |
| `online_suitability_score` | D8 (Online Delivery Suitability) | `D8 / 5 × 100` |

`title_clarity_score` (D1) is reported separately for narrative quality but does not feed the calculator formula.

---

## Layer 2: Content Integrity Check

Independent of the 1–5 instructional dimension scoring. Checks that the program is factually accurate, legally compliant, accessible, and original. Issues are classified by severity.

### Check 2A: Content Accuracy & Currency

- All statistics, regulations, and product details are current (within 12 months of delivery date)
- No factually incorrect statements detected against the approved reference library
- Market data references include source and date
- Product features or regulatory rules match the current version of applicable regulations (check against: `regulatory_scope` argument)

Scoring: 0–30 pts based on proportion of checks passing.

### Check 2B: Regulatory Compliance Language

- Required disclaimers and risk warnings are present on relevant slides
- No prohibited terms (e.g. "guaranteed returns", "risk-free", "no risk") without proper qualification
- Disclosures meet the regulatory scope:
  - MiFID II / MiFIR: suitability language, best execution, inducements disclosures
  - FCA: fair, clear, and not misleading (COBS 4.2); TCF principles
  - SAMA / Saudi CMA: Tadawul / CMA disclosure requirements
  - Internal only: academy standards only
- CPD / CE credit claims are substantiated and hours are correctly calculated

Scoring: 0–25 pts based on proportion of checks passing.

### Check 2C: Accessibility & Design

- Font size ≥ 18pt for body text on slides
- Colour contrast ratio ≥ 4.5:1 (WCAG AA)
- Captions or transcripts available for any embedded video or audio
- Alternative text on all non-decorative images
- No sole reliance on colour to convey information

Scoring: 0–15 pts based on proportion of checks passing.

### Check 2D: Originality & Copyright

- No detected plagiarism against known published sources
- Third-party content (charts, data, frameworks) is properly attributed and licensed
- Academy branding and slide template applied consistently
- No AI-generated content presented as original research without disclosure

Scoring: 0–10 pts based on proportion of checks passing.

### Content Integrity Total Score: 0–80 pts → normalised to 0–100

```
materials_score = (sum of 2A + 2B + 2C + 2D) / 80 × 100
```

### Severity Classification

| Severity | Definition | Blocks Delivery? |
|---|---|---|
| CRITICAL | Regulatory breach, material factual error, or prohibited claim | Yes — forces No-Go |
| MAJOR | Significant gap affecting participant outcomes or misleading content | Conditional Go only |
| MINOR | Best-practice deviation; no regulatory or accuracy impact | No |

---

## Red Flag Triggers (from this skill's output)

| Flag | Triggered When |
|---|---|
| RF-01 | D3 (Objective Quality) ≤ 2 |
| RF-02 | D4 (Content Sequencing) ≤ 2 |
| RF-03 | D8 (Online Delivery Suitability) ≤ 2 OR D6 (Activity Relevance) ≤ 2 |
| RF-08 | D7 (Assessment Alignment) ≤ 2 |
| RF-09 | D6 (Activity Relevance) ≤ 2 AND final module has no transfer/closure activity |

---

## Output

```json
{
  "program_id": "<UUID>",
  "delivery_mode": "online | in_person",

  "instructional_design": {
    "dimension_scores": {
      "title_clarity": 1-5,
      "target_audience_fit": 1-5,
      "objective_quality": 1-5,
      "content_sequencing": 1-5,
      "ksb_balance": 1-5,
      "activity_relevance": 1-5,
      "assessment_alignment": 1-5,
      "online_delivery_suitability": 1-5
    },
    "dimension_justifications": {
      "title_clarity": "<one-sentence finding + evidence reference>",
      "target_audience_fit": "<one-sentence finding + evidence reference>",
      "objective_quality": "<one-sentence finding + evidence reference>",
      "content_sequencing": "<one-sentence finding + evidence reference>",
      "ksb_balance": "<one-sentence finding + evidence reference>",
      "activity_relevance": "<one-sentence finding + evidence reference>",
      "assessment_alignment": "<one-sentence finding + evidence reference>",
      "online_delivery_suitability": "<one-sentence finding + evidence reference>"
    },
    "calculator_sub_scores": {
      "objectives_score": 0-100,
      "sequencing_score": 0-100,
      "activity_design_score": 0-100,
      "assessment_alignment_score": 0-100,
      "online_suitability_score": 0-100
    },
    "triggered_red_flags": ["RF-01", "RF-03"]
  },

  "content_integrity": {
    "materials_score": 0-100,
    "dimension_breakdown": {
      "content_accuracy_currency": 0-30,
      "regulatory_compliance_language": 0-25,
      "accessibility_design": 0-15,
      "originality_copyright": 0-10
    },
    "issues": [
      {
        "check": "2A | 2B | 2C | 2D",
        "severity": "CRITICAL | MAJOR | MINOR",
        "description": "<finding>",
        "location": "<slide number or section>",
        "blocks_delivery": true | false
      }
    ]
  },

  "audit_timestamp": "<ISO-8601>"
}
```

## Notes

- Layer 1 (Instructional Design) and Layer 2 (Content Integrity) are independent. A program can score well on instructional design but fail content integrity (e.g. outdated regulatory references), or vice versa.
- For **in-person programs**, score Dimension 8 as 3 (not applicable) and note this in the justification. The `online_suitability_score` is excluded from the quality_score_calculator for in-person programs.
- CRITICAL content integrity issues must be surfaced immediately to the Pre-Delivery Audit Agent before the instructional dimension scoring is finalised.
