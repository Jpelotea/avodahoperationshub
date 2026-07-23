const fs = require('fs');
const path = require('path');

const root = path.resolve(process.cwd(), 'src');

function read(name) {
  const p = path.join(root, name);
  if (!fs.existsSync(p)) throw new Error(`Missing required Apps Script source: ${name}`);
  return fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
}

function write(name, text) {
  fs.writeFileSync(path.join(root, name), text, 'utf8');
}

function replaceOnce(text, before, after, label) {
  const count = text.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one source match, found ${count}`);
  return text.replace(before, after);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// Calendar.gs: never place the bearer management URL in Google Calendar.
{
  let s = read('Calendar.gs');
  if (!s.includes('function bookingCalendarDescription_(details)')) {
    s = replaceOnce(s,
`function createBookingCalendarEvent_(config, details) {`,
`function bookingCalendarDescription_(details) {
  return [
    'Avodah Operations Hub consultation.',
    'Booking ID: ' + String(details.bookingId || ''),
    'Lead ID: ' + String(details.leadId || ''),
    'Intake ID: ' + String(details.intakeId || '')
  ].filter(Boolean).join('\\n');
}

function createBookingCalendarEvent_(config, details) {`,
      'Calendar.gs helper insertion');
  }
  const oldDescription = `    description: [
      'Avodah Operations Hub consultation.',
      'Booking ID: ' + details.bookingId,
      'Lead ID: ' + details.leadId,
      'Intake ID: ' + details.intakeId,
      details.managementUrl ? 'Manage appointment: ' + details.managementUrl : ''
    ].filter(Boolean).join('\\n'),`;
  if (s.includes(oldDescription)) {
    s = replaceOnce(s, oldDescription,
      `    description: bookingCalendarDescription_(details),`,
      'Calendar.gs description replacement');
  }
  assert(!s.includes("details.managementUrl ? 'Manage appointment:"), 'Calendar.gs still exposes management URL');
  write('Calendar.gs', s);
}

// Bookings.gs: remove managementUrl from Calendar input, revoke token hash on cancellation,
// and expose only client-required management status fields.
{
  let s = read('Bookings.gs');
  if (!s.includes('function publicManagedBookingResult_(item, config)')) {
    s = replaceOnce(s,
`function bookingManagementParts_() {`,
`function publicManagedBookingResult_(item, config) {
  var record = item.record;
  var status = String(record.Status || '');
  if (!AVODAH_ACTIVE_BOOKING_STATUSES[status]) {
    return {ok: false, code: 'BOOKING_NOT_ACTIVE',
      message: 'This appointment management link is no longer available.',
      http_status: 410, retryable: false};
  }
  return {
    ok: true,
    code: 'BOOKING_FOUND',
    http_status: 200,
    retryable: false,
    booking_id: String(record['Booking ID'] || ''),
    status: status,
    active: true,
    start: record.Start instanceof Date ? record.Start.toISOString() : '',
    end: record.End instanceof Date ? record.End.toISOString() : '',
    meet_link: String(record['Meet Link'] || ''),
    timezone: String((config || {}).timezone || AVODAH_CONFIG.TIME_ZONE)
  };
}

function bookingManagementParts_() {`,
      'Bookings.gs public result helper');
  }
  s = s.replace(
`    managementTokenHash: management.hash,
    managementUrl: management.url`,
`    managementTokenHash: management.hash`);
  s = s.replace(
`    'Record Status': 'INACTIVE'
  });`,
`    'Record Status': 'INACTIVE', 'Management Token Hash': ''
  });`);
  s = s.replace(
`      'Record Status': eventStatus === 'Cancelled' ? 'INACTIVE' : 'ACTIVE'
    });`,
`      'Record Status': eventStatus === 'Cancelled' ? 'INACTIVE' : 'ACTIVE',
      'Management Token Hash': eventStatus === 'Cancelled'
        ? '' : String(record['Management Token Hash'] || '')
    });`);
  assert(!s.includes('managementTokenHash: management.hash,\n    managementUrl: management.url'), 'Bookings.gs still forwards management URL to Calendar');
  write('Bookings.gs', s);
}

// WebApp.gs: public status lookup must use the reduced, active-only response.
{
  let s = read('WebApp.gs');
  s = s.replace(
`  return bookingResultFromObject_(item, 'BOOKING_FOUND');`,
`  return publicManagedBookingResult_(item, config);`);
  assert(s.includes('return publicManagedBookingResult_(item, config);'), 'WebApp.gs public managed response hardening missing');
  write('WebApp.gs', s);
}

// LegacyV3.gs: preserve compatibility without exposing/reusing management bearer tokens.
{
  let s = read('LegacyV3.gs');
  s = s.replace('const PRODUCTION_VERSION = "2026-07-23-test-portal-v1.1.0";',
                'const PRODUCTION_VERSION = "2026-07-23-test-portal-v1.1.1";');
  s = s.replace('      managementTokenHash: managementTokenHash,\n      managementUrl: managementUrl,',
                '      managementTokenHash: managementTokenHash,');
  if (!s.includes('function legacyBookingCalendarDescription_(details)')) {
    s = replaceOnce(s,
`function createCalendarEvent_(config, details) {`,
`function legacyBookingCalendarDescription_(details) {
  return [
    "Booked through the Avodah website.",
    "Inquiry: " + String(details.inquiryType || "Consultation"),
    details.mobile ? "Mobile: " + details.mobile : "",
    details.email ? "Email: " + details.email : ""
  ].filter(String).join("\\n");
}

function createCalendarEvent_(config, details) {`,
      'LegacyV3.gs helper insertion');
  }
  const legacyOld = `    description: [
      "Booked through the Avodah website.",
      "Inquiry: " + details.inquiryType,
      details.mobile ? "Mobile: " + details.mobile : "",
      details.email ? "Email: " + details.email : "",
      details.managementUrl ? "Manage appointment: " + details.managementUrl : ""
    ].filter(String).join("\\n"),`;
  if (s.includes(legacyOld)) {
    s = replaceOnce(s, legacyOld,
      `    description: legacyBookingCalendarDescription_(details),`,
      'LegacyV3.gs description replacement');
  }
  if (!s.includes('Object.prototype.hasOwnProperty.call(fields, "tokenHash")')) {
    s = replaceOnce(s,
`  const sheet = record.sheet;
  if (Object.prototype.hasOwnProperty.call(fields, "eventId"))`,
`  const sheet = record.sheet;
  if (Object.prototype.hasOwnProperty.call(fields, "tokenHash")) sheet.getRange(row, 3).setValue(fields.tokenHash || "");
  if (Object.prototype.hasOwnProperty.call(fields, "eventId"))`,
      'LegacyV3.gs tokenHash update support');
  }
  const findBlock = `  const record = findRegistryByToken_(payload.management_token);
  if (!record) {
    return {
      ok: false,
      code: "INVALID_MANAGEMENT_TOKEN",
      message: "This appointment management link is invalid or no longer available.",
      http_status: 403,
      retryable: false
    };
  }`;
  if (s.includes(findBlock) && !s.includes('if (!ACTIVE_BOOKING_STATUSES.has(record.status))')) {
    s = s.replace(findBlock, `${findBlock}

  if (!ACTIVE_BOOKING_STATUSES.has(record.status)) {
    return {
      ok: false,
      code: "INVALID_MANAGEMENT_TOKEN",
      message: "This appointment management link is invalid or no longer available.",
      http_status: 403,
      retryable: false
    };
  }`);
  }
  s = s.replace(
`  updateRegistryAfterManagementAction_(record, {
    status: "Cancelled",`,
`  updateRegistryAfterManagementAction_(record, {
    tokenHash: "",
    status: "Cancelled",`);
  s = s.replace(
`      updateRegistryAfterManagementAction_(record, {
        eventId: event.id,`,
`      updateRegistryAfterManagementAction_(record, {
        tokenHash: eventStatus === "Cancelled" ? "" : record.tokenHash,
        eventId: event.id,`);
  assert(!s.includes('details.managementUrl ? "Manage appointment:'), 'LegacyV3.gs still exposes management URL');
  write('LegacyV3.gs', s);
}

// FoundationTests.gs: add regression assertions if they are not already present.
{
  let s = read('FoundationTests.gs');
  if (!s.includes('modular Calendar description excludes management bearer URL')) {
    const marker = `  var status = publicPortalGateStatus_();`;
    const tests = `  var sentinelManagementUrl = 'https://example.invalid/manage?token=SECRET_BEARER_TOKEN';
  var modularDescription = bookingCalendarDescription_({
    bookingId: 'BOOK-TEST', leadId: 'LEAD-TEST', intakeId: 'INT-TEST',
    managementUrl: sentinelManagementUrl
  });
  testAssert_(tests, 'modular Calendar description excludes management bearer URL',
    modularDescription.indexOf(sentinelManagementUrl) === -1 &&
    modularDescription.indexOf('token=') === -1 &&
    modularDescription.indexOf('Manage appointment:') === -1);
  var legacyDescription = legacyBookingCalendarDescription_({
    inquiryType: 'Consultation', mobile: '09171234567',
    email: 'portal.client@example.com', managementUrl: sentinelManagementUrl
  });
  testAssert_(tests, 'legacy Calendar description excludes management bearer URL',
    legacyDescription.indexOf(sentinelManagementUrl) === -1 &&
    legacyDescription.indexOf('token=') === -1 &&
    legacyDescription.indexOf('Manage appointment:') === -1);
  var managedFixture = {record: {
    'Booking ID': 'BOOK-TEST', 'Lead ID': 'LEAD-SECRET',
    'Intake ID': 'INT-SECRET', 'Google Event ID': 'EVENT-SECRET',
    'Status': 'Scheduled', 'Start': issuedAt,
    'End': new Date(issuedAt.getTime() + 30 * 60 * 1000),
    'Meet Link': 'https://meet.google.com/test-only'
  }};
  var publicManaged = publicManagedBookingResult_(managedFixture,
    {timezone: 'Asia/Manila'});
  testAssert_(tests, 'public management response omits internal linkage identifiers',
    !Object.prototype.hasOwnProperty.call(publicManaged, 'lead_id') &&
    !Object.prototype.hasOwnProperty.call(publicManaged, 'intake_id') &&
    !Object.prototype.hasOwnProperty.call(publicManaged, 'event_id'));
  managedFixture.record.Status = 'Cancelled';
  testAssert_(tests, 'inactive booking management response fails closed',
    publicManagedBookingResult_(managedFixture, {timezone: 'Asia/Manila'}).ok === false);

`;
    s = replaceOnce(s, marker, tests + marker, 'FoundationTests.gs hardening assertions');
  }
  write('FoundationTests.gs', s);
}

// Final fail-closed scans.
for (const name of ['Calendar.gs', 'LegacyV3.gs']) {
  const s = read(name);
  assert(!/Manage appointment:\s*['" ]*\+?\s*details\.managementUrl/.test(s), `${name}: bearer URL leak pattern remains`);
}
assert(read('Bookings.gs').includes("'Management Token Hash': ''"), 'Bookings.gs: cancellation token revocation missing');
assert(read('WebApp.gs').includes('publicManagedBookingResult_'), 'WebApp.gs: reduced public response missing');
console.log('TEST v1.1.1 hardening patch applied and static assertions passed.');
