# The Financial Academy — Secure Examination Management Platform (TFA-EMP)

A working prototype of a secure, enterprise-grade platform for managing the full
lifecycle of professional certification exams: question authoring, blueprinting,
secure assembly & delivery, candidate management, invigilation, scoring,
psychometric analysis, governance, security, and audit.

> **Prototype.** Built to be credible in front of executives, operations,
> certification teams, exam committees, and technology stakeholders. Auth, MFA,
> encryption, browser lockdown, remote proctoring, SMS/WhatsApp and QR
> verification are clearly-labelled **placeholders** wrapped in the correct
> workflow. All data is fictional; **no real exam questions** are included.

## Stack

- **Next.js 14** (App Router) · **TypeScript** · **Tailwind CSS**
- Dependency-free SVG charts · in-repo typed sample-data store (mirrors a
  PostgreSQL schema) · React context for the session/role
- No external runtime services required to run the prototype

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Experiencing the security model — the role switcher

Authentication is a **placeholder**. Instead of logging in, use the **"View as"**
selector in the top bar to walk the platform through each of the 12 roles. The
active role drives every RBAC decision, the security watermark, and the
in-session audit trail. Try, for example:

| View as | What changes |
|---|---|
| **Executive** | Aggregated dashboards only; no question content, no PII, no answers |
| **Question Reviewer** | Can open items and reveal the correct answer (logged) |
| **Question Author** | Sees answers only on **own** drafts (segregation of duties) |
| **Invigilator** | Question Bank is hidden entirely; gets the proctor dashboard |
| **Candidate** | Only the secure exam interface & own results/certificates |
| **Auditor** | Full audit trail and security center, read-only |

## Modules

Executive Dashboard · Certifications · Secure Question Bank · Authoring Workflow ·
Exam Blueprints · Exam Assembly · Sessions · Candidates · Exam Centers ·
Invigilation · Results · Reports (5 tab groups) · Security Center · Incidents ·
Appeals · Certificates · Committees · Vendors · Users & Roles · Audit Trail ·
Settings · Candidate Secure Exam Interface · Notifications.

## Security-first behaviours (demonstrable)

- Unauthorized users get a **restricted view**; the attempt is recorded.
- Revealing a correct answer creates an **access log + audit** entry.
- Live-question export requires **maker-checker approval**, not an instant download.
- Over-exposed items get a **retire-and-replace** advisory; poor-discrimination
  items are **flagged**; unusual pass rates raise **security alerts**.
- Approved exam forms are **locked**; submitted attempts are **locked**; released
  results **record the approver**.
- Secure content screens carry a **diagonal identity watermark** (name · email ·
  IP · timestamp) and disable copy / context-menu / print where the browser allows.

## AI-assisted features

Marked clearly as **advisories** (duplicate suggestions, weak wording, distractor
improvements, retirement recommendations, blueprint-gap hints, item-analysis and
incident summaries, draft committee notes / executive reports / candidate comms).
AI never approves items, changes keys, releases results, or exposes secure content.

## Arabic / RTL

The UI is **English-first** with Arabic RTL support planned: the layout uses
logical structure and a `dir` attribute at the document root, and Settings →
Localization exposes the direction toggle. A future pass adds `ar` translations
and full RTL mirroring.

## Documentation

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — product architecture, **roles matrix**,
  page map, security behaviours, implementation plan.
- [`DATA_MODEL.md`](./DATA_MODEL.md) — the 32-table **PostgreSQL-style schema**.

## Project structure

```
src/
  app/                 # routes (one folder per module) + candidate /exam
  components/          # Shell, Icon, ui primitives, charts, Guard, Watermark
  lib/
    types.ts           # domain types (mirror the DB schema)
    permissions.ts     # RBAC: roles, permissions, grants, SoD rules
    analytics.ts       # bank health, blueprint readiness, item analysis
    session.tsx        # role/session context (auth placeholder) + audit
    nav.ts  format.ts  # navigation config + formatting helpers
  data/seed.ts         # deterministic fictional sample data
```
