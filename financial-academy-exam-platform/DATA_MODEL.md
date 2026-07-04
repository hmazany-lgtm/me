# TFA-EMP — Database Schema (PostgreSQL-style)

Column-level design for the 32 core tables. Types are PostgreSQL. Sensitive
columns are marked 🔒 (encrypted at rest in the target deployment). Every table
that carries exam content or PII is covered by row-level audit via `AuditLogs`.

Conventions: `id` = `uuid PRIMARY KEY DEFAULT gen_random_uuid()`, all tables have
`created_at timestamptz`, `updated_at timestamptz`. FKs shown as `→ Table`.

---

### Identity & Access

**Users**
| col | type | notes |
|---|---|---|
| id | uuid | |
| full_name | text | |
| email | citext unique | |
| mobile | text 🔒 | |
| role_id | uuid → Roles | primary role |
| department | text | |
| status | text | active / suspended / disabled |
| last_login_at | timestamptz | |
| mfa_enabled | bool | placeholder |
| assigned_certifications | uuid[] | scope |
| assigned_centers | uuid[] | scope |
| vendor_id | uuid → Vendors | null unless vendor role |

**Roles** `(id, key, name, description, is_system)`
**Permissions** `(id, key, name, category, sensitivity)`
**RolePermissions** `(role_id → Roles, permission_id → Permissions, scope)` — join table.

---

### Certifications & Products

**Certifications**
| col | type | notes |
|---|---|---|
| id, name, code | uuid/text | code unique, e.g. `TFA-CIB` |
| description, target_audience | text | |
| regulator_owner | text | e.g. SAMA / CMA |
| validity_months, retake_wait_days | int | |
| passing_score | int | % |
| duration_minutes, question_count | int | |
| delivery_methods | text[] | center/remote/blended/third-party |
| languages | text[] | en, ar |
| allowed_question_types | text[] | |
| required_competencies | text[] | |
| exam_fee, retake_fee | numeric | SAR |
| related_programs | text[] | |
| status | text | draft/active/suspended/retired |
| version | int | |

**ExamProducts** `(id, certification_id → Certifications, name, form_strategy, active_forms int)`

---

### Blueprinting

**ExamBlueprints** `(id, certification_id, version, status[draft/approved], total_questions, difficulty_mix jsonb, cognitive_mix jsonb, min_active_per_domain int, approved_by → Users, approved_at)`

**BlueprintDomains** `(id, blueprint_id → ExamBlueprints, name, weight_pct, question_count, competencies text[], learning_outcomes text[], min_active_questions int)`

---

### Question Bank (secure)

**Questions**
| col | type | notes |
|---|---|---|
| id | uuid | display id e.g. `Q-CIB-0142` |
| certification_id | uuid → Certifications | |
| domain | text | |
| competency, learning_outcome | text | |
| difficulty | text | easy/medium/hard |
| cognitive_level | text | recall/understanding/application/analysis/evaluation |
| type | text | single/multiple/truefalse/scenario/case/matching/ordering/numeric/short/simulation |
| stem 🔒 | text | question text |
| explanation 🔒 | text | rationale |
| references | text[] | |
| author_id, reviewer_id, approver_id | uuid → Users | SoD: author ≠ approver |
| version | int | |
| status | text | draft/under_review/approved/active/suspended/retired/compromised |
| usage_count | int | exposure |
| last_used_at | timestamptz | |
| difficulty_index | numeric | p-value 0..1 |
| discrimination_index | numeric | -1..1 |
| point_biserial | numeric | placeholder |
| security_classification | text | internal/confidential/restricted |
| exposure_limit | int | |
| flag_count | int | |

**QuestionOptions** `(id, question_id → Questions, label, text 🔒, is_correct 🔒, chosen_pct numeric)` — `is_correct` gated by `view_correct_answer` permission.

**QuestionVersions** `(id, question_id, version, snapshot jsonb 🔒, changed_by → Users, change_note, created_at)` — archived, never live.

**QuestionReviews** `(id, question_id, stage, assignee → Users, status[pending/approved/rejected/changes], comments, attachments text[], due_date, escalated bool)` — stages: technical / language / psychometric / regulatory / committee.

---

### Exam Forms

**ExamForms** `(id, certification_id, blueprint_id, name, language, status[draft/review/approved/locked], is_locked bool, version, created_by → Users, approved_by → Users, leakage_risk text)`
**ExamFormQuestions** `(id, form_id → ExamForms, question_id → Questions, position int, is_emergency_replacement bool)`

---

### Candidates & Registration

**Candidates**
| col | type | notes |
|---|---|---|
| id, full_name | | |
| national_id 🔒 | text | National ID / Iqama |
| email 🔒, mobile 🔒 | text | |
| employer, sector, city | text | |
| accommodations | text[] | |
| misconduct_history | jsonb | |

**CandidateRegistrations** `(id, candidate_id → Candidates, certification_id, session_id → ExamSessions, attempt_no int, eligibility_status, payment_status, scheduled_at, status[registered/scheduled/attended/no_show/cancelled])`

---

### Sessions, Centers, Rooms

**ExamCenters** `(id, name, city, capacity int, devices int, rooms int, invigilator_pool int, status, satisfaction numeric, revenue_ytd numeric)` — Riyadh, Jeddah, Dammam, Abha, Hail(future).
**ExamRooms** `(id, center_id → ExamCenters, name, seat_capacity int, device_ready bool)`
**ExamSessions** `(id, certification_id, form_id → ExamForms, date, start_time, duration_minutes, center_id, room_id, seat_capacity, delivery_method, vendor_id → Vendors, invigilator_ids uuid[], status[scheduled/active/completed/cancelled/under_investigation])`

---

### Attempts, Responses, Results

**CandidateAttempts** `(id, registration_id → CandidateRegistrations, candidate_id, session_id, form_id, started_at, submitted_at, status[not_started/in_progress/submitted/locked/voided], flags jsonb, is_locked bool)`
**CandidateResponses** `(id, attempt_id → CandidateAttempts, question_id, response 🔒, is_flagged bool, time_spent_sec int, changes_count int, answered_at)` — locked on submit.
**Results** `(id, attempt_id, candidate_id, certification_id, raw_score, scaled_score, passing_score, passed bool, domain_scores jsonb, status[pending/approved/held/released/invalidated], approved_by → Users, released_by → Users, released_at)` — release gated.

---

### Certificates, Incidents, Appeals

**Certificates** `(id, result_id → Results, candidate_id, certificate_no, issued_at, valid_from, valid_to, status[valid/expired/revoked], qr_token, renewal_status)`
**Incidents** `(id, session_id, candidate_id, type, severity[low/med/high/critical], description, evidence text[], reported_by → Users, recommended_action, resolution_status[open/investigating/resolved/closed], created_at)`
**Appeals** `(id, appeal_no, candidate_id, session_id, category, description, evidence text[], assigned_to → Users, sla_due, status[submitted/in_review/decided/closed], decision, communications jsonb)`

---

### Governance & Vendors

**Committees** `(id, name, mandate, members uuid[])`
**CommitteeDecisions** `(id, committee_id → Committees, meeting_date, agenda, decision, documents text[], status[approved/rejected/deferred], action_owners uuid[], due_dates jsonb)`
**Vendors** `(id, name, type[platform/proctoring/center], sla_target numeric, sla_actual numeric, status, assigned_centers uuid[])`

---

### Security, Audit, Notifications

**AuditLogs**
| col | type |
|---|---|
| id, user_id → Users, role_key | |
| action | text (login/failed_login/question_viewed/answer_viewed/question_edited/exported/approved/retired/form_generated/form_approved/candidate_registered/exam_started/exam_submitted/result_changed/result_released/incident_created/report_downloaded/permission_changed) |
| object_type, object_id | text |
| before_value, after_value | jsonb |
| ip_address, device | text |
| risk_level | text (low/medium/high) |
| notes | text |
| created_at | timestamptz |

**QuestionAccessLogs** `(id, question_id, user_id, access_type[view/answer_view/edit/export/delete], ip, watermark_id, created_at)`
**SecurityAlerts** `(id, type[exposure/pass_rate/discrimination/leakage/behavior/access], severity, subject_type, subject_id, message, status[open/ack/resolved], created_at)`
**Notifications** `(id, user_id/candidate_id, channel[email/sms/whatsapp/in_app], template, subject, body, status[queued/sent/read], created_at)`

---

### Indexing & security notes (target deployment)

- Partial index on `Questions(status) WHERE status IN ('active','approved')` for assembly.
- `QuestionOptions.is_correct` and `stem/explanation` encrypted with column keys; decryption gated in the service layer by `view_correct_answer` / `view_question`.
- `AuditLogs` and `QuestionAccessLogs` are **append-only** (no UPDATE/DELETE grants).
- Row-level security by `assigned_certifications` / `assigned_centers` / `vendor_id`.
- `national_id`, `email`, `mobile`, candidate `response` encrypted; masked in UI unless `view_candidate` full.
