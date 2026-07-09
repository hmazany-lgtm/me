# مصطفى | Mustafa – Virtual Trainee Engagement Agent

**An intelligent virtual trainee for The Financial Academy** that joins online
training sessions and acts as an *engagement catalyst* — asking thoughtful
questions, activating participation, supporting the trainer, and turning passive
online sessions into engaging learning experiences.

> Mustafa is **not** a replacement for the trainer. He is a thoughtful,
> respectful, curious trainee who enriches discussion and helps the trainer
> build an active learning environment.

Bilingual (**Arabic-first**, full RTL) · Professional, warm, Saudi tone ·
Built for the financial sector.

---

## ✨ Highlights

- **Six Mustafa personas** — Curious Trainee, Socratic Questioner, Devil's
  Advocate, Engagement Coach (trainer co-pilot), Financial-Sector Practitioner,
  and Quiet-Participant Activator.
- **Engagement Engine** — classifies real-time interventions into 14 types
  (clarifying/deepening/Socratic questions, polls, breakouts, reflections, case
  studies, summaries, energy boosters, trainer reminders, and more) based on
  topic, time elapsed, engagement level, and silence.
- **Live Simulation** — paste what's happening in the session and get suggested
  questions, chat messages, and trainer actions. Approve / edit / reject each.
- **Session Control Room** — live dashboard with engagement health score,
  energy estimate, time-since-last-interaction, a private trainer assistant, and
  ready-to-send suggestions.
- **Question Bank & Activity Generator** — dynamic, categorized questions and
  14 activity formats tuned per sector.
- **Mustafa Engagement Report** — branded, printable, PDF-exportable report with
  score, intervention timeline, best moments, missed opportunities,
  recommendations, follow-up message, and reflective assignment.
- **Role-based access** — Admin, Programme Manager, Trainer, Coordinator, Viewer.
- **Responsible AI** — transparency, data minimization, no unfair evaluation,
  human review of all AI content.

## 🧱 Tech stack

Built on **Lovable's native stack** so it can be edited visually in Lovable:

- **Vite** + **React 18** + **TypeScript**
- **React Router** for client-side routing
- **Tailwind CSS** design system (Financial Academy teal + gold, RTL-aware)
- **AI provider abstraction** (`src/lib/ai/`) — ships with a deterministic
  engine that runs with **zero API keys**; a Claude-compatible hosted provider
  is wired as an optional drop-in (`VITE_AI_API_KEY`).
- **Prisma / PostgreSQL** reference schema (`prisma/schema.prisma`)
- Client-side store seeded from sample data so the demo runs with no backend DB.

## 🚀 Getting started

```bash
npm install
npm run dev        # http://localhost:3000
# or
npm run build && npm run preview
```

No environment variables are required. Optional configuration lives in
`.env.example`.

### 💜 Editing in Lovable

This repo uses Lovable's expected structure (Vite + React + React Router +
Tailwind, `@/` alias to `src/`). To work on it in Lovable, connect Lovable to
this GitHub repo (or import it) — the visual editor will pick up the components,
routes, and Tailwind design tokens directly.

### Demo login

The login page offers five seeded roles (mock auth). Pick **Programme Manager**
to create programmes, or **Trainer** to run the simulation and control room.

### Demo scenario

A ready sample programme is seeded:
**"Compliance and Risk Awareness for Financial Institutions"** (junior compliance
officers, 3 hours) — with objectives, agenda, a full question bank, and sample
Mustafa interventions across the session timeline.

## 🗂️ Project structure

```
index.html               Vite entry
src/
  main.tsx               React root + BrowserRouter
  App.tsx                Route table (all pages)
  index.css              Tailwind layers + design-system component classes
  app/                   Page components (one folder per screen)
    page.tsx             Landing page (wow-factor homepage)
    login/               Role-based mock login
    dashboard/           KPI overview + quick actions
    programmes/          List · detail · create form (all setup fields)
    upload/              Content upload + paste agenda
    analysis/            Programme analysis (summary, themes, moments…)
    personas/            Persona builder / selector
    control-room/        Live session dashboard + trainer private assistant
    simulation/          Live Simulation ("Ask Mustafa")
    interventions/       Intervention taxonomy + ready suggestions
    question-bank/       Dynamic, categorized question bank
    activities/          Activity generator (14 formats)
    reports/             Branded, printable/PDF Engagement Report
    admin/               Admin settings (tone, limits, branding…)
    users/               Roles & permissions matrix
    help/                Responsible AI & privacy + system prompt
  components/            Providers (i18n + auth), shell, UI kit, cards,
                         Link + router adapters (React Router)
  lib/
    types.ts             Full domain model
    i18n.ts              Bilingual dictionary (AR/EN)
    data.ts              Seed users, sample programme, question bank, activities
    personas.ts          The six Mustafa personas
    analysis.ts          Content analysis generator
    qbank.ts             Question bank generator
    report.ts            Engagement report generator
    store.ts             Client persistence layer (localStorage)
    router.ts            Next→React Router navigation shims
    ai/
      prompts.ts         System prompt + persona/tone guidance
      engine.ts          Deterministic engagement engine
      provider.ts        AI provider abstraction (local / hosted)
prisma/schema.prisma     Production data model (PostgreSQL/Supabase)
```

## 🤖 AI prompting logic

Mustafa's behavior is governed by a single strong system prompt
(`src/lib/ai/prompts.ts`), combined with per-persona and per-tone guidance. The
engagement engine (`engine.ts`) turns session context into scored, typed,
bilingual interventions — running entirely client-side. To use a hosted model,
set `VITE_AI_API_KEY`; the provider abstraction keeps the same interface.

## 🔒 Responsible AI

Mustafa is transparent when visible, never impersonates a real human without
disclosure, collects no unnecessary personal data, never embarrasses quiet
participants, never evaluates individuals unfairly, and never gives regulatory,
legal, or financial advice as final authority. All AI-generated content is
reviewable and editable by the trainer before use.

## ✅ Acceptance criteria coverage

- [x] Programme manager can create a programme
- [x] Trainer can upload objectives and agenda
- [x] Mustafa generates engagement questions and activities
- [x] Trainer can run a simulated live session
- [x] Mustafa provides real-time suggestions
- [x] Trainer can approve / edit / reject suggestions
- [x] Session report can be generated and exported (PDF/print)
- [x] Arabic and English supported (Arabic default, RTL)
- [x] Professional UI suitable for The Financial Academy

---

© 2026 The Financial Academy — Mustafa Virtual Trainee Engagement Agent.
