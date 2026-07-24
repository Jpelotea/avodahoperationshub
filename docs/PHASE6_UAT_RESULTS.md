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

Result: PASS WITH TEST HEAD CORRECTION NOTE

### Controlled Runtime Result

- Manual TEST-only runner `runPhase6Uat04Manual` completed successfully from the Apps Script Editor against TEST Head.
- Runtime returned `UAT04_MANUAL_PASS` and completed normally.
- The validation suite confirmed all 18 active Project 1 mappings and the approved total of 41 points across Recruitment, Sales, and Joint Field Coaching.
- The validation suite also confirmed unique mapping keys, Week 1–4 bucket rules, required-proof enforcement, activity/sub-activity relationship enforcement, monthly counts and points, three activity-type analytics grouping, and the Project 1 ID prefix.
- Controlled Activity ID: `P1-20260725-021137-ec3fcdaef4`.
- Controlled Agent Code: `UAT04-20260725021135`.
- Controlled activity: Recruitment / Orientation Attendance.
- Assigned Team Member: `Ma'am Christine`.
- Awarded points: `2`.
- Required data and proof URL persistence passed.
- Notes-column availability and Notes persistence passed.
- Reporting Week resolved to `Week 4`; Reporting Month resolved to `2026-07`.
- Controlled weekly points were `2`; controlled monthly record count was `1`; controlled monthly points were `2`.
- Duplicate replay was blocked and did not create duplicate activity credit.
- Audit logging passed.

### Independent Spreadsheet Verification

- `Project 1 Activity Database` now includes the `Notes` header as column T.
- Row 40 contains exactly one active controlled record for Activity ID `P1-20260725-021137-ec3fcdaef4` and Agent Code `UAT04-20260725021135`.
- The row is `UNIQUE`, `ACTIVE`, Recruitment / Orientation Attendance, and worth `2` points.
- Required Data JSON contains the controlled prospect name and orientation date.
- The controlled proof URL is retained.
- Reporting Week is `Week 4`; Reporting Month displays as `2026-07`.
- The controlled Notes value is retained in column T.
- A duplicate search for the controlled Agent Code returned only the one active master record.
- `Activity Audit Log` row 123 contains exactly one successful `PROJECT1_ACTIVITY_SUBMITTED` event for the controlled Activity ID, with the expected activity type, sub-activity, points, duplicate status, source, and request ID.

### Safety Gate Closure

- Final direct safety reset returned `UAT04_SAFETY_GATES_RESET` in environment `TEST` with `productionTouched=false`.
- `ENABLE_BOOKING_WORKFLOW=FALSE`.
- `ENABLE_PROJECT1_WRITES=FALSE`.
- `ENABLE_RECRUITMENT_WRITES=FALSE`.
- `ENABLE_ANALYTICS_WRITES=FALSE`.
- `ENABLE_SCHEDULE_IMPORT_WRITES=FALSE`.
- `ENABLE_CALENDAR_WRITES=FALSE`.
- `PUBLIC_PORTAL_ENABLED=FALSE`.
- `ENABLE_AUTOMATION_TRIGGERS=FALSE`.
- Production remained untouched.

### Defects and Corrections

**LOW — Reporting-month runner assertion false failure.** The first controlled run wrote the correct Week 4 and July 2026 values, but the TEST-only runner compared the date-formatted Reporting Month cell through a raw string conversion. The runner was corrected to normalize the stored value through `project1MonthValue_()`. The first failed fixture was safely changed to `VOID`; the final run passed.

**MEDIUM — Project 1 Notes were accepted but not persisted.** The live TEST validation path accepted `payload.notes`, but the Project 1 schema lacked a Notes column and the row writer omitted the value. TEST Head was corrected to add the `Notes` schema header and write `validated.notes`. A TEST-only non-destructive migration appended column T without rewriting existing rows. The final controlled run independently verified Notes persistence. This defect is closed for TEST Head.

**LOW — Initial Notes schema migration used the wrong helper.** The first TEST-only migration called `ensureSheetForDefinition_()`, which only ensures sheet existence and does not synchronize headers. It was corrected to call `appendMissingHeaders_()`. The corrected migration added the Notes column and preserved existing rows.

**MEDIUM — TEST deployment variance pending.** The Project 1 Notes product correction exists in TEST Head and the TEST spreadsheet schema has been migrated, but Apps Script deployment `@2` was intentionally left unchanged. Before production migration, the corrected source must be packaged into an explicitly approved immutable TEST version and the relevant deployed/internal-hub path must be regression-tested.

### Failed and Superseded Attempts Preserved as Evidence

- The first controlled UAT-04 run false-failed only on the obsolete Reporting Month assertion; its created row was safely changed to `VOID` and a cleanup audit record was written.
- A subsequent controlled run passed all core reporting checks but returned `UAT04_MANUAL_PASS_WITH_NOTES_GAP`, correctly exposing the product Notes-persistence defect.
- After the TEST Head product correction and schema migration, the final controlled run returned `UAT04_MANUAL_PASS` with `notesFieldAvailable=true` and `notesPersisted=true`.
- Failed or false-negative temporary GitHub workflow attempts are retained as diagnostic evidence and are not counted as functional UAT passes.

### Decision

UAT-04 accepted for TEST Head. The documented mapping, validation, points, single-record append, weekly/monthly rollup, identity, proof/notes retention, duplicate prevention, audit, and final gate-closure criteria are satisfied. Before production migration, package the UAT-03 and UAT-04 product corrections into an approved immutable TEST version and rerun the relevant deployed-path regressions. Proceed to UAT-05 — Recruitment Workflow. Production activation remains NOT AUTHORIZED.

---

## UAT-05 — Recruitment Workflow

Result: PASS

### Controlled Runtime Result

- Manual TEST-only runner `runPhase6Uat05Manual` completed successfully from the Apps Script Editor against TEST Head.
- Runtime returned `UAT05_MANUAL_PASS` and completed normally.
- Recruitment validation tests passed for controlled stage/status values, No Show stage rejection, score validation and averaging, phone text storage, valid Initial-to-Final progression, and prevention of Final Interview regression to Screening.
- Controlled hired Applicant ID: `APP-20260725-030528-b5b585635a`.
- Controlled rejected Applicant ID: `APP-20260725-030643-3b5a9d1c52`.
- Controlled withdrawn Applicant ID: `APP-20260725-030651-ba8decae2e`.
- Applicant Tracking remained the primary pipeline source for all three controlled applicants.
- The hired lifecycle created three linked Interview Records: one Initial Interview No Show, one completed Initial Interview, and one completed Final Interview.
- No Show remained a status on the Initial Interview stage.
- Rescheduled remained a status on the Initial Interview stage.
- The hired applicant advanced through Screening, Initial Interview, Final Interview, Requirements, Onboarding, and Closed/Hired.
- The rejected applicant closed as `Closed/Rejected`.
- The withdrawn applicant closed as `Closed/Withdrawn`.
- Duplicate applicant replay returned the existing rejected Applicant ID rather than creating a second applicant.
- The hired applicant received two verified requirement records and two completed onboarding records.
- Rejected and withdrawn applicants received no inapplicable requirements or onboarding rows.
- All controlled TEST interview Calendar events were removed after the lifecycle.

### Independent Spreadsheet and Calendar Verification

- `Applicant Tracking` row 4 contains the hired applicant as `Closed/Hired`, Interview Status `Completed`, Final Decision `Proceed`, Requirements Status `Complete`, Onboarding Status `Complete`, and Record Status `ACTIVE`.
- `Applicant Tracking` row 5 contains the rejected applicant as `Closed/Rejected`, with blank requirements and onboarding summaries because those trackers were not applicable.
- `Applicant Tracking` row 6 contains the withdrawn applicant as `Closed/Withdrawn`, with blank requirements and onboarding summaries because those trackers were not applicable.
- `Interview Records` rows 8–10 contain exactly three records linked to the hired Applicant ID: two Initial Interviews and one Final Interview; statuses are one `No Show` and two `Completed`; completed interviews retain the expected scores, overall score `4.17`, result `Proceed`, Meet links, and Calendar Event IDs.
- `Applicant Timeline` contains nine hired-applicant movements, two rejected-applicant movements, and four withdrawn-applicant movements, for the expected total of 15 controlled timeline records.
- Timeline evidence shows `No Show` and `Rescheduled` only as statuses; neither appears as a pipeline stage.
- `Requirements Tracker` rows 6–7 contain the hired applicant's two verified TEST requirements.
- `Onboarding Tracker` rows 6–7 contain the hired applicant's two completed TEST onboarding steps.
- Searches of Requirements Tracker and Onboarding Tracker returned zero records for both the rejected and withdrawn Applicant IDs.
- A direct TEST Calendar search for the hired Applicant ID on July 26, 2026 returned no remaining event, independently confirming Calendar cleanup.

### Recruitment Analytics Verification

- The source-backed recruitment analytics snapshot changed from 2 to 5 total applicants after the three controlled records were created.
- Hired applicants changed from 2 to 3.
- The final status breakdown contains `Hired: 3`, `Rejected: 1`, and `Withdrawn: 1`.
- The analytics model therefore consumed all three controlled records and separated their closed outcomes correctly.
- Follow-up for UAT-06: the current `Active Applicants` card is based on active record status rather than open pipeline stage/status. Closed outcomes remain Record Status `ACTIVE`, so the card changed from 2 to 5. This is consistent with the current source model but the label and intended business meaning should be reviewed during analytics UAT.

### Safety Gate and Environment Closure

- A direct pre-run safety reset returned `UAT05_SAFETY_GATES_RESET` with all eight controlled gates FALSE.
- The runner temporarily enabled only `ENABLE_RECRUITMENT_WRITES` and `ENABLE_CALENDAR_WRITES` for the TEST lifecycle.
- The runner's `finally` block restored all eight controlled gates to FALSE.
- Final runtime output directly confirmed `ENABLE_BOOKING_WORKFLOW=FALSE`, `ENABLE_PROJECT1_WRITES=FALSE`, `ENABLE_RECRUITMENT_WRITES=FALSE`, `ENABLE_ANALYTICS_WRITES=FALSE`, `ENABLE_SCHEDULE_IMPORT_WRITES=FALSE`, `ENABLE_CALENDAR_WRITES=FALSE`, `PUBLIC_PORTAL_ENABLED=FALSE`, and `ENABLE_AUTOMATION_TRIGGERS=FALSE`.
- Environment remained `TEST`; `productionTouched=false`.
- Apps Script deployment `@2` remained unchanged.

### Defects and Notes

- No BLOCKER, HIGH, MEDIUM, or LOW product defect was opened from UAT-05.
- The Activity Log sheet is not the recruitment audit store and therefore contained no Applicant ID match; recruitment evidence is retained in Applicant Tracking, Interview Records, Applicant Timeline, Requirements Tracker, Onboarding Tracker, Calendar cleanup, and source-backed analytics.
- The `Active Applicants` metric-label observation is deferred to UAT-06 and is not classified as a UAT-05 failure.

### Decision

UAT-05 accepted. Applicant Tracking remained the primary pipeline record; interviews were linked correctly; timeline movements were complete; requirements and onboarding were created only when applicable; No Show and Rescheduled remained statuses; Hired, Rejected, and Withdrawn outcomes were consistent; recruitment analytics consumed the expected records; Calendar cleanup completed; and all safety gates were restored to FALSE. Proceed to UAT-06 — Analytics and Dashboard. Production activation remains NOT AUTHORIZED.
