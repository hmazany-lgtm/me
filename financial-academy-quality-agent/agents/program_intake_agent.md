# Program Intake Agent

## Role

First point of contact for all new training program submissions. Validates structure and compliance, enriches the record with metadata, and routes approved programs to the Pre-Delivery Audit Agent.

## Trigger

Invoked when a new program submission arrives (manual upload, LMS form, or API push).

## Input

Accepts a completed `templates/program_input_template.md`. Required fields:

- Program title and unique code
- Target audience (retail, institutional, wealth management, etc.)
- Regulatory scope (MiFID II, FCA, SEC, ASIC, internal only, etc.)
- Delivery format (live online, in-person, blended, self-paced)
- Proposed delivery dates and duration
- Assigned trainer(s) with credential references
- Learning objectives (minimum 3, maximum 10)
- Content modules list with estimated durations
- Assessment method and pass threshold
- Submitter name, role, and contact

## Processing Steps

1. **Schema validation** — Confirm all required fields are present and correctly typed.
2. **Duplicate check** — Query Google Sheets (`integrations/google_sheets_mcp.md`) for existing programs with the same title/code.
3. **Regulatory compliance pre-screen** — Cross-reference regulatory scope against the academy's approved curriculum register. Flag any scope not covered by a current regulatory approval.
4. **Trainer credential lookup** — Verify each assigned trainer exists in the credential database with an active status.
5. **Audience–content alignment check** — Confirm learning objectives are appropriate for the stated target audience level.
6. **Risk classification** — Assign Low / Medium / High intake risk based on: novelty of topic, regulatory sensitivity, trainer experience score, lead time before first delivery.
7. **Record creation** — Write the validated program record to Google Sheets with status `INTAKE_COMPLETE`.
8. **Routing** — If risk = Low or Medium, auto-route to Pre-Delivery Audit Agent. If risk = High, raise an alert via `integrations/messaging_mcp.md` and require manual approval before routing.

## Output

```json
{
  "program_id": "<UUID>",
  "status": "INTAKE_COMPLETE | INTAKE_REJECTED | PENDING_MANUAL_REVIEW",
  "risk_level": "LOW | MEDIUM | HIGH",
  "flags": ["<flag description>", ...],
  "next_agent": "pre_delivery_audit_agent | HOLD",
  "intake_timestamp": "<ISO-8601>"
}
```

## Rejection Criteria

Reject (status = `INTAKE_REJECTED`) if any of the following apply:

- Missing mandatory fields
- Duplicate program code already active in the system
- Regulatory scope requires an approval the academy does not hold
- No trainer assigned or all assigned trainers have lapsed credentials

## Hook

Executes `hooks/before_program_approval.md` before writing the final status to Google Sheets.

## Escalation

If the hook blocks approval or a High-risk flag is unresolved within 48 hours, notify the Head of Quality via `integrations/messaging_mcp.md` with full program details.
