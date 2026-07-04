# The Financial Academy — Secure Examination Management Platform (TFA-EMP)

> Product architecture, roles matrix, data model, page map, and implementation plan.
> This document is the design contract for the prototype in this repository.

---

## 1. Product Vision

A secure, enterprise-grade platform that runs the **full lifecycle of professional
certification exams** for The Financial Academy (TFA): question authoring, exam
blueprinting, secure assembly & delivery, candidate management, invigilation,
scoring, psychometric item analysis, governance, security, and audit.

The guiding principle is **security-first, least-privilege**: exam content and
correct answers are protected assets. Nothing sensitive is shown unless the
viewer holds the exact permission, and every sensitive action is logged.

### Architecture at a glance

```
┌────────────────────────────────────────────────────────────────┐
│                        Presentation (Next.js App Router)          │
│  Executive · Certifications · Question Bank · Blueprints ·        │
│  Assembly · Sessions · Candidates · Centers · Invigilation ·     │
│  Results · Reports · Security · Incidents · Appeals · Certs ·     │
│  Committees · Vendors · Users · Audit · Settings · Candidate Exam │
├────────────────────────────────────────────────────────────────┤
│  RBAC Guard Layer  (permission checks, SoD rules, maker-checker) │
│  Audit Interceptor (every sensitive read/write emits AuditLog)   │
│  Secure Content Layer (masking, watermark, answer-key gating)    │
├────────────────────────────────────────────────────────────────┤
│      Domain Services (mocked)   ·   Sample Data Store (TS)        │
│  certifications · questions · blueprints · forms · candidates ·  │
│  sessions · results · psychometrics · security · governance      │
├────────────────────────────────────────────────────────────────┤
│   PostgreSQL-style schema (documented in DATA_MODEL.md)          │
│   Auth placeholder · MFA placeholder · Encryption-at-rest notes  │
└────────────────────────────────────────────────────────────────┘
```

### Technology

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 14 (App Router)** | Server components + client interactivity |
| Language | **TypeScript** | End-to-end types from the data model |
| Styling | **Tailwind CSS** | Design tokens for the TFA identity |
| Charts | Custom lightweight SVG chart components | No heavy runtime deps; deterministic |
| State | React context (role/session), typed data store | Auth is a placeholder; role switcher for demo |
| Backend (proto) | In-repo typed data store + service functions | Mirrors a real REST/RPC API surface |
| DB (target) | PostgreSQL | Schema documented, not provisioned in proto |

> **Prototype scope note.** This is a working, navigable prototype meant to be
> credible in front of executives, ops, certification teams, exam committees,
> and technology stakeholders. Authentication, MFA, encryption, browser
> lockdown, remote proctoring, SMS/WhatsApp, and QR verification are implemented
> as clearly-labelled **placeholders** with the correct workflow around them.

---

## 2. User Roles Matrix

Twelve roles. Permissions are granular (see `src/lib/permissions.ts`). "●" = allowed,
"◐" = allowed but masked/aggregated, blank = denied.

| Permission ↓  Role → | Sys Admin | Exam Ops Mgr | Cert Mgr | Q. Author | Q. Reviewer | Psychometrician | Committee Approver | Invigilator | Candidate | Auditor | Executive | Vendor |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| View question (stem)        | ● | ● | ● | ● | ● | ● | ● |   |   | ◐ |   |   |
| View correct answer         | ● |   |   | ●¹| ● | ● | ● |   |   |   |   |   |
| Edit question               | ● |   |   | ●¹|   |   |   |   |   |   |   |   |
| Approve question            | ● |   |   |   |   |   | ● |   |   |   |   |   |
| Export question             | ● | ◐ |   |   |   | ◐ |   |   |   |   |   |   |
| Generate exam form          | ● | ● | ● |   |   |   |   |   |   |   |   |   |
| Approve exam form           | ● |   |   |   |   |   | ● |   |   |   |   |   |
| View candidate              | ● | ● | ● |   |   |   |   | ◐ | self | ◐ |   | ◐ |
| Edit candidate              | ● | ● | ● |   |   |   |   |   |   |   |   |   |
| Release result              | ● |   | ● |   |   |   | ● |   |   |   |   |   |
| View reports                | ● | ● | ● |   |   | ● | ● |   |   | ● | ◐ | ◐ |
| Download reports            | ● | ● | ● |   |   | ● | ● |   |   | ● |   |   |
| Run invigilation            | ● | ● |   |   |   |   |   | ● |   |   |   |   |
| Manage users                | ● |   |   |   |   |   |   |   |   |   |   |   |
| View audit logs             | ● | ◐ |   |   |   |   | ◐ |   |   | ● |   |   |
| Governance decisions        | ● |   |   |   |   |   | ● |   |   | ◐ |   |   |
| View security center        | ● | ● |   |   |   | ◐ | ◐ |   |   | ● |   |   |
| Sit exam (candidate app)    |   |   |   |   |   |   |   |   | ● |   |   |   |

¹ Authors may edit/see answers **only** on their own draft questions, never approve them.

### Segregation of Duties (enforced rules)

- **Authors cannot approve their own questions** (maker ≠ checker on the same item).
- **Exam-form creators cannot release results alone** (release needs Cert Mgr / Committee).
- **Invigilators have zero access to question-bank content.**
- **Candidates cannot access reports or audit.**
- **Executives see aggregated information only** (no raw item content, no answers).
- **Vendors see only assigned operational data** (their sessions/centers).

---

## 3. Data Model (summary)

Full column-level schema is in **`DATA_MODEL.md`**. 32 core tables:

`Users, Roles, Permissions, RolePermissions, Certifications, ExamProducts,
ExamBlueprints, BlueprintDomains, Questions, QuestionOptions, QuestionVersions,
QuestionReviews, ExamForms, ExamFormQuestions, Candidates, CandidateRegistrations,
ExamSessions, ExamCenters, ExamRooms, CandidateAttempts, CandidateResponses,
Results, Certificates, Incidents, Appeals, AuditLogs, Notifications, Committees,
CommitteeDecisions, Vendors, QuestionAccessLogs, SecurityAlerts.`

Key relationships:

```
Certification 1─* ExamProduct 1─1 ExamBlueprint 1─* BlueprintDomain
Certification 1─* Question *─1 (author/reviewer/approver → Users)
Question 1─* QuestionOption
Question 1─* QuestionVersion   Question 1─* QuestionReview
ExamForm *─* Question  (via ExamFormQuestion)
Candidate 1─* CandidateRegistration *─1 ExamSession
ExamSession *─1 ExamCenter 1─* ExamRoom     ExamSession *─1 ExamForm
CandidateAttempt 1─* CandidateResponse       CandidateAttempt 1─1 Result
Result 1─0..1 Certificate
Everything sensitive → AuditLog + (questions) QuestionAccessLog
Alerts ← SecurityAlerts (exposure / pass-rate / discrimination / leakage)
```

---

## 4. Page Map

| # | Route | Module | Primary roles |
|---|---|---|---|
| 1 | `/` | Executive Dashboard | Executive, Ops, Admin |
| 2 | `/certifications` · `/certifications/[id]` | Certifications & Exam Products | Cert Mgr |
| 3 | `/question-bank` · `/question-bank/[id]` | Secure Question Bank | Author, Reviewer, Psychometrician |
| 4 | `/authoring` | Question Authoring Workflow | Author, Reviewer, Committee |
| 5 | `/blueprints` · `/blueprints/[id]` | Exam Blueprinting | Cert Mgr, Psychometrician |
| 6 | `/assembly` · `/assembly/[id]` | Exam Assembly | Ops, Committee |
| 7 | `/sessions` · `/sessions/[id]` | Exam Scheduling & Hosting | Ops |
| 8 | `/candidates` · `/candidates/[id]` | Candidate Management | Ops, Cert Mgr |
| 9 | `/centers` · `/centers/[id]` | Exam Centers & Utilization | Ops |
| 10 | `/invigilation` | Invigilator / Proctor Dashboard | Invigilator |
| 11 | `/results` · `/results/[id]` | Scoring & Results | Cert Mgr, Committee |
| 12 | `/reports` | Reports & Analytics (5 tab groups) | Ops, Exec, Auditor, Psych |
| 13 | `/security` | Security Center | Admin, Ops, Auditor |
| 14 | `/incidents` · `/incidents/[id]` | Incidents | Ops, Invigilator |
| 15 | `/appeals` · `/appeals/[id]` | Appeals & Complaints | Ops, Cert Mgr |
| 16 | `/certificates` | Certificate Issuance | Cert Mgr |
| 17 | `/committees` · `/committees/[id]` | Governance & Committees | Committee |
| 18 | `/vendors` | Vendor Management | Ops, Vendor (scoped) |
| 19 | `/users` | Users & Roles | Admin |
| 20 | `/audit` | Audit Trail | Auditor, Admin |
| 21 | `/settings` | Settings & QA workflows | Admin |
| 22 | `/exam/[attemptId]` | **Candidate Secure Exam Interface** | Candidate |
| 23 | `/notifications` | Notifications center | all |

---

## 5. Security-First Behaviours (implemented in the prototype)

1. Unauthorized user opens a question → **restricted view** (stem masked, no options/answer).
2. Any user views a correct answer → **QuestionAccessLog + AuditLog** entry created.
3. Export attempt on live questions → **export-approval workflow** (maker-checker), not an instant download.
4. Overexposed question → **"recommend retirement"** advisory on the item.
5. Unusual pass rate → **SecurityAlert** generated and shown on Security Center.
6. Poor discrimination (negative/low) → item **flagged for review**.
7. Approved exam form → **locked** from editing (immutable badge, edits require emergency workflow).
8. Candidate submits exam → responses **locked**, no answer content ever shown post-exam.
9. Results released → **approval recorded** (who/when) before candidate can see them.
10. Every sensitive screen carries a **diagonal watermark** with name · email · timestamp · IP.
11. Question review screens **disable copy/paste, context menu, and print** where the browser allows.

---

## 6. Implementation Plan (module by module)

**Phase 0 — Foundations** ✅
Scaffold Next.js + TS + Tailwind, design tokens (TFA identity), layout shell
(sidebar + topbar + watermark), role context + role switcher, RBAC + permission
engine, audit interceptor, typed data store + sample data.

**Phase 1 — Core executive & content** (priority per request)
1. Executive Dashboard (KPIs, charts, filters, drill-down).
2. Certifications module (list + detail with blueprint/stats/versioning/approval).
3. Secure Question Bank (list + secure detail, answer gating, watermark, access log).
4. Exam Blueprinting (domains/weights, readiness R/Y/G validation).
5. Reports module (5 tab groups, item analysis, no-leak rule).

**Phase 2 — Delivery & operations**
6. Exam Assembly engine. 7. Sessions & hosting. 8. Candidates. 9. Centers.
10. Invigilation dashboard. 11. Results & scoring. 22. Candidate secure exam UI.

**Phase 3 — Governance, security, trust**
4. Authoring workflow. 13. Security Center. 14. Incidents. 15. Appeals.
16. Certificates. 17. Committees. 18. Vendors. 19. Users. 20. Audit. 21. Settings.

**Cross-cutting:** AI-assist advisories (clearly labelled), notifications,
question-bank health score, center utilization analytics, QA workflows,
Arabic/RTL readiness (i18n structure + `dir` support planned).

**Deliverables checklist:** frontend screens · documented schema · RBAC logic ·
sample data · dashboard charts · secure question bank · candidate exam UI ·
invigilator dashboard · reports · audit trail · security center · approval
workflows · responsive layout · in-code documentation.
