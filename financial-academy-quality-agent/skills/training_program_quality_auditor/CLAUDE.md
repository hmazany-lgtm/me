# Skill: Training Program Quality Auditor

## Purpose

Performs a structured, multi-dimensional quality audit of training materials for financial programs. Called by the Pre-Delivery Audit Agent to produce an objective materials score before delivery.

## Invocation

```
skill: training_program_quality_auditor
args:
  program_id: <UUID>
  materials_package: <URL or structured payload>
  regulatory_scope: <e.g. "MiFID II", "FCA CP22/1", "internal">
  target_audience: <e.g. "retail advisers", "institutional sales">
```

## Audit Dimensions

### 1. Content Accuracy & Currency (30 pts)
- All statistics, regulations, and product details are current (within 12 months).
- No factually incorrect statements detected against the approved reference library.
- Market data references include source and date.

### 2. Learning Objective Alignment (20 pts)
- Each module maps to at least one stated learning objective.
- Assessments / knowledge checks test the stated objectives, not peripheral topics.
- Bloom's taxonomy level appropriate for the target audience.

### 3. Regulatory Compliance Language (25 pts)
- Required disclaimers and risk warnings present on relevant slides.
- No prohibited terms (e.g. "guaranteed returns", "risk-free") without proper qualification.
- Disclosures meet the regulatory scope requirements (MiFID II suitability language, FCA fair, clear, not misleading standard, etc.).
- CPD / CE credit claims are substantiated.

### 4. Accessibility & Design (15 pts)
- Font size ≥ 18pt for body text on slides.
- Colour contrast ratio ≥ 4.5:1 (WCAG AA).
- Captions / transcripts available for any embedded video or audio.
- Alternative text on all non-decorative images.

### 5. Originality & Copyright (10 pts)
- No detected plagiarism against known sources.
- Third-party content properly attributed and licensed.
- Academy branding and template applied consistently.

## Scoring

Total score = sum of dimension scores (max 100). Each dimension is scored 0 to its maximum points based on the proportion of checks that pass.

## Output

```json
{
  "program_id": "<UUID>",
  "materials_score": 0-100,
  "dimension_breakdown": {
    "content_accuracy_currency": 0-30,
    "learning_objective_alignment": 0-20,
    "regulatory_compliance_language": 0-25,
    "accessibility_design": 0-15,
    "originality_copyright": 0-10
  },
  "issues": [
    {
      "dimension": "<name>",
      "severity": "CRITICAL | MAJOR | MINOR",
      "description": "<issue>",
      "slide_or_section": "<reference>"
    }
  ],
  "audit_timestamp": "<ISO-8601>"
}
```

## Severity Definitions

| Severity | Definition | Blocks Delivery? |
|---|---|---|
| CRITICAL | Regulatory breach or material factual error | Yes |
| MAJOR | Significant gap affecting participant outcomes | Conditional Go only |
| MINOR | Best-practice deviation; no regulatory impact | No |
