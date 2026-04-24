# TFA Intelligent Survey System — Complete Design Document

## Overview

The TFA Training Landscape Study is a **smart, adaptive market intelligence platform** — not a standard survey. It is designed to generate strategic insight for The Financial Academy's 2027–2031 product and partnership strategy.

---

## 1. Survey Questions (15 Questions, 5 Blocks)

### Block 1: Market Demand
| # | Question (EN) | Role | Type | Strategic Purpose |
|---|---|---|---|---|
| Q1 | Which sector does your organization primarily operate in? | All | Dropdown | Segments all data by sector |
| Q2 | How would you describe current demand for financial training? | L&D, Business Leader, Regulator, Gov | Single Choice | Baseline demand signal |
| Q3 | What are the top capability gaps you are trying to address? | L&D, Business Leader, Regulator, Gov | Multi Choice (max 3) | Product design opportunities |

### Block 2: Training Volume & Intensity
| # | Question (EN) | Role | Type | Strategic Purpose |
|---|---|---|---|---|
| Q4 | How many training days per employee annually? | L&D, Finance, Business Leader | Single Choice | Training intensity proxy |
| Q5 | How has your training investment trended over 2 years? | L&D, Finance | Single Choice | Market momentum signal |
| Q6 | What is the primary training format used? | L&D, Business Leader, Vendor | Single Choice | TFA delivery model strategy |

### Block 3: External Providers & Gaps
| # | Question (EN) | Role | Type | Strategic Purpose |
|---|---|---|---|---|
| Q7 | What proportion of training is delivered externally? | L&D, Finance, Business Leader | Single Choice | External market dependency |
| Q8 | Why do you use external providers? | L&D, Business Leader | Multi Choice | TFA competitive positioning |
| Q9 | How satisfied are you with current Saudi market quality? | L&D, Business Leader, Regulator, Gov | Rating 1–5 | Market quality gap signal |

### Block 4: Future Trends
| # | Question (EN) | Role | Type | Strategic Purpose |
|---|---|---|---|---|
| Q10 | Which topics will you prioritize in 2025–2027? | L&D, Business Leader, Regulator, Gov, Vendor | Multi Choice (max 3) | Forward demand → product roadmap |
| Q11 | How prepared is your workforce for AI tools? | L&D, Business Leader, Regulator, Gov | Single Choice | AI literacy program signal |
| Q12 | How will you meet mandatory regulatory training requirements? | L&D, Finance, Regulator | Single Choice | SAMA/CMA revenue opportunity |

### Block 5: Strategic Partnership
| # | Question (EN) | Role | Type | Strategic Purpose |
|---|---|---|---|---|
| Q13 | Is your organization open to co-designing programs with TFA? | L&D, Business Leader, Regulator, Gov | Single Choice | Partnership appetite |
| Q14 | What would make a TFA partnership most valuable? | L&D, Business Leader, Regulator, Gov, Vendor | Multi Choice (max 2) | Value proposition design |
| Q15 | What is the single biggest training access challenge you face? | L&D, Business Leader, Regulator, Gov, Vendor | Short Answer | Qualitative market intelligence |

---

## 2. Adaptive Logic Engine

```
Respondent enters → declares Role + Sector
         ↓
Logic Engine filters question set
         ↓
Role: Finance  → shows Q5 (budget trends), hides Q2, Q3, Q8, Q9, Q13
Role: Regulator → shows Q12 (compliance), hides Q4–Q8
Role: Vendor    → shows market demand + partnership, hides Q4, Q5, Q7, Q12
Role: Government → shows market demand + future trends only
         ↓
Sector: Insurance → full survey (highest regulatory training demand)
Sector: FinTech   → emphasizes AI + digital questions
         ↓
Confidence scoring → flags low-quality responses (< 5-char text answers)
```

---

## 3. Data Model (JSON Schema)

```json
{
  "SurveyQuestion": {
    "id": "string",
    "block": "market_demand | training_volume | external_providers | future_trends | strategic_partnership",
    "order": "number",
    "type": "single_choice | multiple_choice | short_answer | number_range | rating_scale | dropdown | conditional",
    "status": "draft | review | published | archived",
    "textEn": "string",
    "textAr": "string",
    "options": [{"id": "string", "value": "string", "labelEn": "string", "labelAr": "string"}],
    "visibleToRoles": ["ld_hr | finance | business_leader | regulator | government | vendor"],
    "visibleToSectors": ["banking | insurance | capital_markets | financing | payments | government | training_provider | other"],
    "logicRules": [{"conditions": [...], "action": "show | hide | skip_to"}],
    "required": "boolean",
    "version": "number"
  },
  "SurveyResponse": {
    "id": "string",
    "respondentRole": "string",
    "sector": "string",
    "companySize": "under_100 | 100_500 | 500_2000 | over_2000",
    "answers": [{"questionId": "string", "questionVersion": "number", "value": "string | string[] | number"}],
    "confidenceScore": "number (0-1)",
    "isComplete": "boolean",
    "language": "en | ar"
  }
}
```

---

## 4. Platform Architecture

```
tfa-survey-system/
├── src/app/
│   ├── page.tsx                    # Public landing page (bilingual)
│   ├── survey/page.tsx             # Adaptive survey (role-personalized)
│   ├── thank-you/page.tsx          # Completion + reward page
│   ├── admin/
│   │   ├── layout.tsx              # Admin sidebar + top bar
│   │   ├── page.tsx                # Overview dashboard
│   │   ├── questions/page.tsx      # Question builder (CRUD + bilingual)
│   │   ├── logic/page.tsx          # Conditional logic builder
│   │   ├── preview/page.tsx        # Role-based survey preview
│   │   ├── analytics/page.tsx      # Heatmaps + AI insights
│   │   ├── export/page.tsx         # Multi-format data export
│   │   └── users/page.tsx          # Admin role management
│   └── api/
│       ├── questions/route.ts      # GET/POST/PUT/DELETE questions
│       ├── responses/route.ts      # GET/POST responses
│       └── analytics/route.ts      # GET aggregated analytics
├── src/lib/
│   ├── types.ts                    # Full TypeScript type system
│   ├── logic-engine.ts             # Adaptive visibility + confidence scoring
│   └── store.ts                    # Zustand state (survey + admin)
└── src/data/
    └── questions.ts                # 15 seeded questions (bilingual)
```

---

## 5. Analytics & Dashboard

### Metrics tracked:
- **Demand signals** by sector × topic (heatmap)
- **Training intensity** (days/employee) by sector
- **External dependency** percentage by sector
- **Capability gap rankings** across all respondents
- **Future topic priorities** (product roadmap input)
- **Partnership appetite** distribution
- **Market quality satisfaction** gap vs. benchmark

### AI Insight Engine (5 insight categories):
1. **Launch** — new programs TFA should build
2. **Stop** — programs with low demand to discontinue
3. **Pricing** — segments where premium pricing is feasible
4. **Partnership** — co-design opportunities with institutions
5. **Regulatory** — SAMA/CMA leverage points

---

## 6. Response Quality & Validation

| Validation | Method |
|---|---|
| Required field check | Server-side before storage |
| Range validation | Numeric answers checked against min/max |
| Confidence scoring | Based on required completion rate + text quality heuristics |
| Role consistency | Role enum validated on POST |
| Random answer detection | Short text (< 5 chars) triggers quality penalty |

---

## 7. Data Collection Strategy

### Phase 1: Regulatory Leverage (Weeks 1–2)
- **SAMA, CMA, Insurance Authority** endorse the study in a joint communication
- Frame as "Financial Sector Training Needs Assessment" — not a TFA promotional survey
- All SAMA-regulated institutions (~200) receive official invitation

### Phase 2: Institution Outreach (Weeks 3–5)
**Segmented by institution type:**

| Segment | Approach | Target |
|---|---|---|
| Top 10 banks | Direct CEO/CLO outreach via relationship | 100% response |
| Insurance companies | Automated email + Regulator endorsement | 70% response |
| Capital markets | CMA-forwarded invitation | 65% response |
| FinTech / Payments | Direct digital outreach | 50% response |
| Government entities | Ministry of Finance channel | 40% response |

### Phase 3: Incentive Structure
1. **Benchmark Report** (all respondents) — shows their institution vs. sector average
2. **Early access to study findings** (early completers)
3. **Invitation to TFA Strategic Partners Forum** (complete respondents only)
4. **Co-branding opportunity** on published report (top institutions)

### Phase 4: Follow-up Model (Week 6+)
- Non-responders at Week 3 → automated reminder with data preview excerpt
- Non-responders at Week 5 → personal phone call from TFA strategy team
- Response target: **200+ institutions** before analysis lock

### Phase 5: Analysis Lock & Report
- Data collection closes at 200 complete responses or Week 8
- Automated analytics dashboard generates benchmark report per sector
- Strategic findings published as "Saudi Financial Sector Training Landscape Report 2025"
- TFA uses findings for 2027–2031 product strategy

---

## 8. Admin Dashboard Features

| Feature | Status |
|---|---|
| Question Builder (CRUD, bilingual, drag-reorder) | ✅ Built |
| Question Types (7 types) | ✅ Built |
| Role-based visibility per question | ✅ Built |
| Sector-based visibility per question | ✅ Built |
| Conditional Logic Builder | ✅ Built |
| Options Management (bilingual, add/remove) | ✅ Built |
| Preview Mode (per role/sector/language) | ✅ Built |
| Publishing Workflow (Draft → Review → Published) | ✅ Built |
| Version History (question version tracking) | ✅ Built |
| User Roles (Super Admin / Strategy Editor / Viewer) | ✅ Built |
| Analytics Dashboard with Heatmap | ✅ Built |
| AI Insight Engine | ✅ Built |
| Export Center (CSV, JSON, Power BI) | ✅ Built |
| API Endpoints (questions, responses, analytics) | ✅ Built |

---

## 9. Bilingual Design

All user-facing content is bilingual (English + Saudi Arabic):
- Survey questions + hints in both languages
- Answer options in both languages
- Language toggle on every page
- RTL layout support (`dir="rtl"`) for Arabic mode
- Admin dashboard bilingual navigation labels
- Arabic uses natural Saudi financial sector terminology (not literal translations)

---

## 10. Financial Sustainability Model

| Revenue Stream | Mechanism |
|---|---|
| Benchmark Reports | Sell detailed sector reports to non-respondents |
| Program Design | Use data to justify pricing for new TFA programs |
| Corporate Partnerships | Co-design revenue from institutions identified as partners |
| Regulatory Training | Leverage SAMA/CMA data to win mandatory training contracts |
| Research Licensing | License anonymized dataset to consulting firms |
