# Phase 6 — UAT Results

Environment: TEST only
Production: UNTOUCHED
Baseline: TEST v1.1.1, Apps Script deployment @2

## UAT-01 — Baseline Safety and Configuration

Result: PASS WITH EVIDENCE NOTE

### Verified

- TEST spreadsheet ID matches the approved TEST spreadsheet: `1f8rZ8hVxMnrrFwnfezMhG1CklxDizdtC2IRvEnbC13s`.
- Spreadsheet title is `TEST - Calendar_Dashboard_Avodah - 2026-07-22`.
- Spreadsheet timezone is `Asia/Manila`.
- Required operational sheets are present, including Dashboard, Booking Registry, Booking Reconciliation, Booking Audit, Booking Blackouts, Intake Submissions, Activity Log, Calendar Log, individual Calendar views, Daily Report, Weekly Report, Targets & Settings, Schedule Import, Schedule Import Preview, Lead Database, recruitment sheets, Project 1 Activity Database, Activity Audit Log, Automation Log, Monthly Reports, analytics sheets, and Reports and Analytics.
- TEST booking Calendar binding is `avodahwealthadvisory@gmail.com`.
- Calendar access was confirmed by a read-only event search against the configured Calendar.
- Booking configuration remains TEST-safe: `SEND_GUEST_INVITES=FALSE`; booking schedule/timezone settings are present and unchanged.
- The retained TEST deployment workflow is manual-only (`workflow_dispatch` only; no push trigger).
- Final preserved verification confirms the target TEST web-app deployment is Apps Script `@2` and the hardened source checks passed.
- The latest setup records in Automation Log repeatedly report `triggers.status=SKIPPED_DISABLED`, `created=[]`, and warnings that automation triggers remain disabled until explicitly enabled.
- No UAT-01 action created data, installed triggers, changed Calendar events, enabled gates, pushed Apps Script source, created a new Apps Script version, or touched production.

### Gate Evidence

- Final v1.1.1 verification describes the deployed target as hardened with all write gates disabled.
- The TEST settings area inspected during UAT-01 shows the relevant Boolean safety controls currently FALSE.

### Evidence Limitation

The currently connected tools do not expose a direct API to enumerate Apps Script installable triggers in real time. Therefore, the trigger criterion is supported by the system's own latest setup/audit records showing trigger creation skipped/disabled and by the fact that the v1.1.1 deployment, cleanup, and UAT-01 procedures did not install triggers. A direct trigger-count check must be repeated before production activation through an Apps Script runtime/admin execution path.

### Defects

- No BLOCKER, HIGH, MEDIUM, or LOW defect opened from UAT-01.

### Decision

UAT-01 accepted. Proceed to UAT-02 — Intake to Lead Lifecycle.

---

## UAT-02 — Intake to Lead Lifecycle

Result: PASS WITH CONFIGURATION NOTE

### Controlled Runtime Result

- Manual TEST-only runner `runPhase6Uat02Manual` completed successfully.
- Controlled Submission ID: `9c3e1a7b-4f62-4b2d-8c15-6e7a9f0d2b31`.
- Created Intake ID: `INT-20260723-235320-dc9877b4fd`.
- Created Lead ID: `LEAD-20260723-235323-73ee121377`.
- First submission returned `PUBLIC_INTAKE_ACCEPTED`.
- Replay of the same Submission ID returned `PUBLIC_INTAKE_REPLAY`.
- Exactly one Intake row and one linked logical Lead row were produced.
- Email and phone normalization checks passed.
- Intake and Lead follow-up status checks passed.
- The controlled fixture requested no consultation booking.

### Independent Spreadsheet Verification

- `Intake Submissions` contains exactly one row for the controlled Submission ID.
- The Intake row is `PROCESSED`, `UNIQUE`, source `PUBLIC_PORTAL`, and links to the expected Intake ID and Lead ID.
- The Intake row contains normalized email `uat02.manual.20260723@example.com` and normalized phone `+639171234568`.
- `Lead Database` contains exactly one row for `LEAD-20260723-235323-73ee121377`.
- The Lead row links to `INT-20260723-235320-dc9877b4fd`, is `ACTIVE`, has Lead Status `NEW`, Follow-up Status `New`, Duplicate Status `UNIQUE`, and Inquiry Count `1`.

### Idempotency and Duplicate Handling

- Same Submission ID replay did not create a second Intake row.
- Replay returned the same Intake/Lead linkage through the idempotent path.
- The linked Lead remained a single logical Lead with Inquiry Count `1` for this controlled replay test.

### Safety Gate Closure

- Before the successful runtime test, the first manual attempt was blocked because one or both of `ENABLE_BOOKING_WORKFLOW` and `ENABLE_CALENDAR_WRITES` were unexpectedly TRUE.
- The runner stopped before enabling `PUBLIC_PORTAL_ENABLED` and before creating any Intake or Lead data.
- TEST-only safety function `resetPhase6Uat02SafetyGates` was run to set `PUBLIC_PORTAL_ENABLED`, `ENABLE_BOOKING_WORKFLOW`, and `ENABLE_CALENDAR_WRITES` to FALSE.
- The successful UAT runner used `try/finally` and restored `PUBLIC_PORTAL_ENABLED=FALSE` before returning.
- Final user-observed gate state after UAT-02: `PUBLIC_PORTAL_ENABLED=FALSE`, `ENABLE_BOOKING_WORKFLOW=FALSE`, `ENABLE_CALENDAR_WRITES=FALSE`.
- Production remained untouched.

### Configuration Finding

**MEDIUM — TEST write-gate configuration drift.** One or both booking/calendar write gates were found TRUE at the start of the first manual UAT attempt, despite earlier baseline evidence describing write gates as disabled. Public portal access was FALSE, and the safety assertion prevented UAT writes under the unexpected state. The three UAT-relevant gates were explicitly restored to FALSE before the successful test. Root cause of the gate drift remains to be determined before production migration.

### Failed Automation Attempts Preserved as Evidence

- Earlier temporary POST/GET web-runner attempts did not complete the UAT and did not produce partial Intake/Lead records.
- Each temporary deployment attempt restored the hardened TEST source and target deployment to Apps Script `@2`.
- The temporary GET V2 attempt verified its temporary deployment pointer but never observed the temporary endpoint marker; UAT execution was skipped before gate/data writes.
- These failed attempts are retained as diagnostic evidence and are not counted as functional UAT passes.

### Decision

UAT-02 accepted with one MEDIUM configuration finding for gate-drift root-cause review. Proceed to UAT-03 — Consultation Booking and Calendar Lifecycle.

---

## UAT-03 — Consultation Booking and Calendar Lifecycle

Result: PASS WITH DEPLOYMENT NOTE

### Controlled Runtime Result

- Manual TEST-only runner `runPhase6Uat03Manual` completed successfully from the Apps Script Editor against TEST Head.
- Controlled Booking ID: `BOOK-20260724-214432-97819c77fc`.
- Calendar event creation passed.
- Calendar description security check passed: no management URL, raw management token, or `Manage appointment` text was present.
- Calendar private metadata contained only the management-token hash.
- Google Meet creation passed.
- Active public management lookup passed and exposed no internal `lead_id`, `intake_id`, or `event_id` fields.
- Reschedule propagation passed.
- Cancellation passed.
- Management-token revocation passed.
- Intake/Lead source-link cleanup passed.
- Reconciliation preserved the safe inactive state.
- Runtime returned `UAT03_MANUAL_PASS` and the execution completed normally.

### Independent Spreadsheet Verification

- `Booking Registry` contains the controlled Booking ID with Status `Cancelled`, Record Status `INACTIVE`, blank Management Token Hash, Reconciliation Status `OK`, and no Last Error.
- `Calendar Log` contains the controlled Booking ID with Status `Cancelled`, Record Status `Archived`, Sync Status `Synced`, and no Sync Error.
- `Intake Submissions` retained exactly one controlled Intake row and has blank Appointment Date, Booking ID, and Calendar Event ID after cancellation.
- `Lead Database` retained exactly one controlled Lead row with Follow-up Status `New` and blank Appointment Date, Booking ID, and Calendar Event ID after cancellation.
- `Booking Audit` records `BOOKING_CREATED`, `BOOKING_RESCHEDULED`, and `BOOKING_CANCELLED` for the controlled Booking ID, all with Result `SUCCESS`.

### Security and Lifecycle Verification

- No raw bearer management token was written to the Calendar description.
- Calendar private metadata stored the management-token hash rather than the raw token.
- Public management status omitted internal lead/intake/event identifiers.
- The cancelled management token no longer resolved an active booking.
- Cancellation cleared the Management Token Hash in the registry.
- Cancellation archived the Calendar Log entry and cleared source appointment links.
- Google Calendar may return a deleted event tombstone with `status: cancelled`; the runner was corrected to accept either an absent event or a cancelled tombstone while still rejecting a non-cancelled event.

### Safety Gate Closure

- The runner required `PUBLIC_PORTAL_ENABLED`, `ENABLE_BOOKING_WORKFLOW`, and `ENABLE_CALENDAR_WRITES` to be FALSE before starting.
- It temporarily enabled only those three TEST gates for the controlled lifecycle.
- Its `finally` block restored all three gates to FALSE.
- A completed `UAT03_MANUAL_PASS` execution confirms the fail-closed gate cleanup completed without throwing.
- Guest invitations remained disabled.
- Production remained untouched.

### Defects and Corrections

**MEDIUM — Cancellation left stale source identifiers.** The live TEST implementation of `clearBookingSourceAppointment_()` originally reset Follow-up Status and Appointment Date but did not clear Booking ID or Calendar Event ID from Intake and Lead records. This was reproduced during UAT-03, corrected in TEST Head, and verified through a second cleanup and the final successful lifecycle run.

**LOW — UAT assertion did not recognize Calendar cancellation tombstones.** The initial runner expected a deleted event to return only `null`. Google Calendar returned a resource with `status: cancelled`, causing a false UAT failure after the actual cancellation succeeded. The TEST-only runner assertion was corrected and the full UAT subsequently passed.

**MEDIUM — TEST deployment variance pending.** The product correction for clearing stale source identifiers exists and is verified in TEST Head, but Apps Script web deployment `@2` was intentionally left unchanged. The deployed TEST public web app therefore requires a new immutable TEST version/deployment refresh and endpoint-level regression before this correction can be considered deployed.

### Interrupted and Failed Attempts Preserved as Evidence

- One manually cancelled execution left a partial rescheduled booking. A dedicated TEST-only recovery function cancelled/inactivated the record, cleared the token hash, archived the Calendar Log, removed the Calendar event when present, and restored the gates.
- An earlier completed lifecycle reached successful cancellation but failed only on the obsolete tombstone assertion; independent evidence confirmed the product cancellation had succeeded.
- Invalid or mismatched temporary GitHub workflow attempts are retained in repository history and diagnostics where available; they are not counted as UAT passes.

### Decision

UAT-03 accepted for TEST Head with one MEDIUM deployment-variance item pending. Before production migration, create a new immutable TEST Apps Script version containing the verified source-link correction, update the TEST deployment, and rerun endpoint-level booking cancellation regression. Proceed to UAT-04 — Project 1 Reporting.

---

## UAT-04 — Project 1 Reporting

Result: IN PROGRESS

Preparation requirement: keep all unrelated write gates FALSE, use one controlled TEST Project 1 submission, verify points mapping, master database append, proof/notes handling, Week 1–4/monthly rollups, idempotency or duplicate behavior, audit logging, and fail-closed gate restoration. Production remains untouched.