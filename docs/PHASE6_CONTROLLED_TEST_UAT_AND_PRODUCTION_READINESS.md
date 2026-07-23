# Phase 6 — Controlled TEST UAT and Production Readiness

Status: IN PROGRESS
Environment: TEST only
Production: UNTOUCHED
Baseline: TEST v1.1.1, Apps Script deployment @2

## 1. Purpose

This phase converts the verified TEST v1.1.1 build into a controlled user-acceptance and production-readiness process. The goal is to prove the complete Avodah Operations Hub workflow under realistic TEST use before any production activation.

No production migration, production trigger installation, production gate activation, or production Calendar write is authorized by this phase.

## 2. Verified Starting Baseline

The starting TEST state is:

- Hardened modular Apps Script source deployed.
- Existing TEST web-app deployment points to Apps Script version 2.
- Deployment workflow is manual-only.
- Historical TEST Calendar descriptions containing private management URLs were sanitized.
- Historical TEST management-token hashes inspected during cleanup were revoked.
- Security regression checks passed.
- Write/public activation gates remain disabled unless a specific controlled UAT step explicitly requires a temporary TEST-only activation.
- Production remains untouched.

Any UAT run must restore temporary TEST gates to FALSE after the test and must not install production triggers.

## 3. UAT Execution Order

### UAT-01 — Baseline Safety and Configuration

Acceptance criteria:

- TEST spreadsheet is the expected copy and timezone is Asia/Manila.
- Required operational sheets are present.
- TEST Calendar binding is the expected TEST-approved Calendar.
- Public/write gates are disabled before testing.
- No unintended installable triggers are present.
- Current TEST web-app deployment is @2.
- Manual-only deployment control remains intact.

Result: PENDING

### UAT-02 — Intake to Lead Lifecycle

Test one new controlled TEST inquiry.

Acceptance criteria:

- Intake submission is accepted only through the intended TEST path.
- Exactly one Intake Submissions record is created.
- Exactly one Lead Database record is created.
- Lead and Intake IDs link correctly.
- Normalized contact fields are populated correctly.
- Duplicate/idempotent replay does not create a second logical lead.
- Follow-up status is correct.
- No production spreadsheet or Calendar data is changed.

Result: PENDING

### UAT-03 — Consultation Booking and Calendar Lifecycle

Use only controlled TEST data and the TEST Calendar path.

Acceptance criteria:

- Availability respects configured booking hours, horizon, notice, duration, and buffers.
- A valid slot creates exactly one Booking Registry record.
- Calendar event is created in the expected Calendar.
- Google Meet is created when configured.
- Booking Registry and Calendar Log link to the same booking/event.
- Calendar event description contains no private management bearer URL or raw management token.
- Public management response exposes only client-required fields.
- Conflict booking is rejected.
- Idempotent replay does not create a duplicate booking.
- Reschedule updates Calendar and records consistently.
- Cancellation removes/invalidates active management authorization and cleans up the event as designed.
- Reconciliation detects and repairs supported record drift.
- Temporary TEST gates are returned to FALSE after the run.

Result: PENDING

### UAT-04 — Project 1 Reporting

Test controlled records across Recruitment, Sales, and Joint Field Coaching.

Acceptance criteria:

- Activity type and sub-activity mapping is correct.
- Required fields are enforced per sub-activity.
- Points match the approved 18-activity mapping.
- Submission appends exactly one master activity record.
- Weekly and monthly rollups update correctly.
- Agent/FA/UH identity is preserved.
- Proof links and notes are retained where applicable.
- No duplicate points are created from replayed submissions.

Result: PENDING

### UAT-05 — Recruitment Workflow

Test one controlled applicant through representative stages.

Acceptance criteria:

- Applicant Tracking remains the primary pipeline record.
- Interview Records are linked correctly.
- Applicant Timeline records stage/status changes.
- Requirements Tracker and Onboarding Tracker update only when applicable.
- No-show and reschedule remain statuses rather than duplicate pipeline stages.
- Hired/Rejected/Withdrawn handling is consistent.
- Dashboard/analytics consume the expected recruitment records.

Result: PENDING

### UAT-06 — Analytics and Dashboard

Acceptance criteria:

- Lead Analytics matches source lead records.
- Recruitment Analytics matches applicant/interview sources.
- Calendar and Booking Analytics match booking/calendar sources.
- Project 1 Performance Analytics matches activity records and points.
- Reports and Analytics aggregates without double counting.
- Dashboard excludes Ma'am Christine from team performance metrics where configured.
- No dashboard cell acts as an unintended editable source of truth.

Result: PENDING

### UAT-07 — Scheduled Reporting Logic

This validates reporting logic without installing production triggers.

Acceptance criteria:

- Daily/weekly/monthly report generation logic can execute against TEST data.
- Generated summaries reconcile with source records.
- Duplicate scheduled execution is idempotent or safely repeatable.
- Failure logging is visible in the intended operational/audit log.
- No production email, trigger, or external notification is activated.

Result: PENDING

### UAT-08 — Schedule Import

Acceptance criteria:

- Import preview is generated before commit.
- Invalid or conflicting rows are flagged.
- Approved rows map to Calendar Log correctly.
- Category/owner/status values respect controlled vocabularies.
- Import does not silently overwrite unrelated schedule data.
- Re-running the same import does not create unintended duplicates.

Result: PENDING

### UAT-09 — Security and Regression Closure

Acceptance criteria:

- Calendar descriptions contain no management bearer URL.
- Inactive/cancelled booking management lookup fails closed.
- Internal linkage identifiers are not exposed in public management responses.
- Management token hashes are cleared/revoked on cancellation paths.
- Deployment remains @2 or a later explicitly approved hardened version.
- Deployment workflow remains manual-only.
- TEST gates are FALSE after testing.
- No unexpected triggers remain installed.

Result: PENDING

## 4. Defect Severity During UAT

- BLOCKER: security exposure, production data impact, authorization bypass, duplicate financial/activity credit, or destructive data loss.
- HIGH: broken end-to-end core workflow, Calendar/booking inconsistency, incorrect reporting totals, or unrecoverable reconciliation failure.
- MEDIUM: partial workflow defect with safe manual workaround.
- LOW: cosmetic, wording, layout, or non-blocking usability issue.

Any BLOCKER stops production-readiness progression immediately.

## 5. Production-Readiness Exit Criteria

Production may only be considered after all of the following are true:

1. UAT-01 through UAT-09 are PASS.
2. No open BLOCKER or HIGH defects remain.
3. All temporary TEST activation gates are restored to FALSE.
4. No unintended TEST or production triggers are present.
5. Production spreadsheet, Calendar binding, deployment ID, script properties, secrets, access roles, and notification recipients are separately inventoried and approved.
6. A production backup/rollback point is prepared before migration.
7. Production migration steps are written as an explicit runbook.
8. Production activation requires a separate approval step; TEST success alone does not authorize production changes.

## 6. Planned Deliverables

- Completed UAT results matrix.
- Defect log with severity and disposition.
- Final production configuration inventory.
- Production migration runbook.
- Rollback runbook.
- Go/No-Go checklist.

## 7. Current Decision

Proceed with controlled TEST UAT only.

Production activation: NOT AUTHORIZED.
