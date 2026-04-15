# Hook: Before Program Approval

## Event

`before_program_approval`

Fires immediately before the Program Intake Agent writes a final `INTAKE_COMPLETE` or `INTAKE_REJECTED` status to Google Sheets. If this hook fails or returns a block signal, the status write is prevented and the program is held in `PENDING_MANUAL_REVIEW`.

## Purpose

Acts as a last-line governance gate to ensure that no program is formally approved without satisfying mandatory compliance and risk requirements that cannot be checked programmatically by the intake agent alone.

## Checks Performed

### 1. Regulatory Approval Currency
- Query the academy's regulatory approval register (Google Sheets) to confirm that all applicable approvals (e.g. FCA authorisation, CPD accreditation body sign-off) are valid and not expiring within 30 days.
- **Block condition**: Any required approval is expired or expires within 30 days and no renewal is in progress.

### 2. Conflict of Interest Screen
- Check whether any assigned trainer has a disclosed conflict of interest with the program topic or client organisation on record.
- **Block condition**: Unresolved conflict of interest exists for an assigned trainer.

### 3. Mandatory Review Sign-Off
- Confirm that a second Quality Coordinator (not the submitter) has reviewed and initialled the program record in Google Sheets for any program flagged as High-risk at intake.
- **Block condition**: High-risk program lacks a second reviewer sign-off.

### 4. Data Protection Check
- Confirm the program's participant data handling statement is completed (for programs collecting personal data beyond name and attendance).
- **Block condition**: Statement absent for programs handling personal financial data or special category data.

### 5. Capacity Check
- Query `integrations/calendar_mcp.md` to confirm the assigned trainer is not double-booked on the proposed dates.
- **Block condition**: Trainer schedule conflict detected.

## Hook Response

```json
{
  "hook": "before_program_approval",
  "program_id": "<UUID>",
  "result": "PASS | BLOCK",
  "checks": [
    {"name": "<check name>", "status": "PASS | BLOCK | WARN", "detail": "<optional message>"}
  ],
  "block_reason": "<human-readable explanation if result is BLOCK>",
  "timestamp": "<ISO-8601>"
}
```

## On Block

1. Program status is set to `PENDING_MANUAL_REVIEW` in Google Sheets.
2. Notification sent to the Head of Quality and the submitter via `integrations/messaging_mcp.md` with the block reason.
3. The program must be remediated and the intake agent re-invoked. The hook runs again on re-submission.

## On WARN (non-blocking)

A warning is logged to the program record in Google Sheets and included in the audit trail, but the approval proceeds.
