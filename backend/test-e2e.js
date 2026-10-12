/**
 * CivicTrack Complete End-to-End Verification Test Suite
 * Tests authentication, RBAC, issue lifecycle, comments, upvotes,
 * status updates, admin verification, and notifications.
 */

const BASE_URL = 'http://localhost:5000/api';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => null);
  return { status: res.status, headers: res.headers, data };
}

function parseCookies(res) {
  const raw = res.headers.get('set-cookie');
  if (!raw) return '';
  return raw.split(';')[0];
}

async function runTests() {
  console.log('========================================================');
  console.log('   CIVICTRACK END-TO-END SYSTEM INTEGRATION VERIFICATION ');
  console.log('========================================================\n');

  let testsPassed = 0;
  let testsFailed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      testsPassed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      testsFailed++;
    }
  }

  try {
    // 1. Health check
    console.log('--- 1. Health & Server Connectivity ---');
    const health = await request('/health');
    assert(health.status === 200 && health.data.success === true, 'GET /api/health returns 200 OK');

    // 2. Authentication - Citizen Registration
    console.log('\n--- 2. Citizen Registration & Validation ---');
    const uniqueEmail = `test.citizen.${Date.now()}@civictrack.org`;
    const regRes = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Automated Test Citizen',
        email: uniqueEmail,
        password: 'Password123!',
      }),
    });
    assert(regRes.status === 201 && regRes.data.success === true, 'Citizen registration creates 201 Created');
    const registeredUser = regRes.data.user || regRes.data.data;
    assert(registeredUser?.role === 'citizen', 'New registered user defaults to role: citizen');

    // 3. Authentication - Login & JWT Cookie Issuance
    console.log('\n--- 3. Login & Session Cookie ---');
    const loginRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: uniqueEmail,
        password: 'Password123!',
      }),
    });
    const citizenCookie = parseCookies(loginRes);
    assert(loginRes.status === 200 && loginRes.data.success === true, 'Login with valid credentials succeeds with 200');
    assert(Boolean(citizenCookie), 'HttpOnly auth cookie civictrack_token received');

    // 4. Current User Session Verification
    console.log('\n--- 4. Session Verification (/auth/me) ---');
    const meRes = await request('/auth/me', {
      headers: { Cookie: citizenCookie },
    });
    const currentUser = meRes.data.user || meRes.data.data;
    assert(meRes.status === 200 && currentUser?.email === uniqueEmail, 'GET /api/auth/me resolves current user session');

    // 5. Citizen Uploads Real Media File
    console.log('\n--- 5. Media Upload (/issues/media) ---');
    const dummyPngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    const formData = new FormData();
    const blob = new Blob([dummyPngBuffer], { type: 'image/png' });
    formData.append('photos', blob, 'pothole_evidence.png');

    const uploadRes = await fetch(`${BASE_URL}/issues/media`, {
      method: 'POST',
      headers: { Cookie: citizenCookie },
      body: formData,
    });
    const uploadData = await uploadRes.json();
    assert(uploadRes.status === 201 && Array.isArray(uploadData.urls) && uploadData.urls.length > 0, 'Citizen uploads real photo evidence via multer');
    const uploadedUrl = uploadData.urls[0];
    assert(uploadedUrl.startsWith('/uploads/'), `Server returned persistent upload path: ${uploadedUrl}`);

    // 6. Citizen Creates Issue with Real Coordinates and Uploaded Media
    console.log('\n--- 6. Issue Creation with Real GPS & Media (/issues) ---');
    const issueRes = await request('/issues', {
      method: 'POST',
      headers: { Cookie: citizenCookie },
      body: JSON.stringify({
        title: 'Deep Hazardous Pothole on Oak Ave',
        description: 'Large 8-inch pothole creating traffic hazard near crossing.',
        category: 'pothole',
        priority: 'HIGH',
        location: '450 Oak Avenue',
        lat: 40.7128,
        lng: -74.006,
        images: [uploadedUrl],
        ward: 'Ward 4',
      }),
    });
    assert(issueRes.status === 201 && issueRes.data.success === true, 'Citizen creates issue with 201 Created');
    const createdIssue = issueRes.data.data;
    const issueId = createdIssue.id || createdIssue._id;
    assert(Boolean(createdIssue?.ticketId), `Issue ticket generated: ${createdIssue?.ticketId}`);
    assert(createdIssue?.lat === 40.7128 && createdIssue?.lng === -74.006, 'Coordinates (lat, lng) accurately persisted in MongoDB');
    assert(Array.isArray(createdIssue?.images) && createdIssue.images[0] === uploadedUrl, 'Persisted images points to uploaded file URL');

    // Verify Citizen was awarded +25 civic points
    const meAfterReport = await request('/auth/me', { headers: { Cookie: citizenCookie } });
    const citizenPoints = (meAfterReport.data.user || meAfterReport.data.data)?.points;
    assert(citizenPoints >= 25, `Citizen awarded civic points for reporting (current points: ${citizenPoints})`);

    // 6. Upvote Issue
    console.log('\n--- 6. Issue Upvoting ---');
    const upvoteRes = await request(`/issues/${issueId}/upvote`, {
      method: 'POST',
      headers: { Cookie: citizenCookie },
    });
    assert(upvoteRes.status === 200 && upvoteRes.data.upvotes === 1, 'Citizen toggles upvote ON (upvotes: 1)');

    // Toggle upvote OFF
    const toggleOffRes = await request(`/issues/${issueId}/upvote`, {
      method: 'POST',
      headers: { Cookie: citizenCookie },
    });
    assert(toggleOffRes.status === 200 && toggleOffRes.data.upvotes === 0, 'Citizen toggles upvote OFF (upvotes: 0)');

    // 7. Add Comment to Issue
    console.log('\n--- 7. Comments ---');
    const commentRes = await request(`/issues/${issueId}/comments`, {
      method: 'POST',
      headers: { Cookie: citizenCookie },
      body: JSON.stringify({ text: 'Water department was also alerted regarding nearby drain.' }),
    });
    assert(commentRes.status === 201 && commentRes.data.data?.comments?.length >= 1, 'Posting comment returns 201 with updated comments list');

    // 8. Admin Verification & Officer Assignment
    console.log('\n--- 8. Admin Authorization & Issue Lifecycle ---');
    const adminLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin.intake@civictrack.gov',
        password: 'Password123!',
      }),
    });
    const adminCookie = parseCookies(adminLogin);
    assert(adminLogin.status === 200, 'Admin login succeeds');

    // Admin verifies issue
    const verifyRes = await request(`/issues/${issueId}/status`, {
      method: 'PATCH',
      headers: { Cookie: adminCookie },
      body: JSON.stringify({
        status: 'Verified',
        note: 'Admin verified incident location on CCTV.',
      }),
    });
    assert(verifyRes.status === 200 && verifyRes.data.data.status === 'Verified', 'Admin verifies issue with status: Verified');

    // Officer account details
    const officerLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'm.vance@citygov.org',
        password: 'Password123!',
      }),
    });
    const officerCookie = parseCookies(officerLogin);
    const officerUser = officerLogin.data.user;
    assert(officerLogin.status === 200, 'Officer login succeeds');

    // Admin assigns issue to Officer
    const assignRes = await request(`/issues/${issueId}/assign`, {
      method: 'PATCH',
      headers: { Cookie: adminCookie },
      body: JSON.stringify({
        officerId: officerUser.id,
        department: 'Public Works',
      }),
    });
    assert(assignRes.status === 200 && assignRes.data.data.status === 'Assigned', 'Admin assigns issue to Officer Vance');

    // 9. Officer Status Transition
    console.log('\n--- 9. Officer Status Transition ---');
    const statusUpdateRes = await request(`/issues/${issueId}/status`, {
      method: 'PATCH',
      headers: { Cookie: officerCookie },
      body: JSON.stringify({
        status: 'In Progress',
        note: 'Field crew dispatched to site on Oak Ave.',
      }),
    });
    assert(statusUpdateRes.status === 200 && statusUpdateRes.data.data.status === 'In Progress', 'Officer transitions status to In Progress');

    // 10. Notifications Verification
    console.log('\n--- 10. Notifications Delivery ---');
    const notifsRes = await request('/notifications', {
      headers: { Cookie: citizenCookie },
    });
    assert(notifsRes.status === 200 && Array.isArray(notifsRes.data.data), 'Citizen receives notifications array');
    assert(notifsRes.data.data.length > 0, `Notifications delivered to reporter (count: ${notifsRes.data.data.length})`);

    // 11. Leaderboard & Stats
    console.log('\n--- 11. Leaderboard & Analytics ---');
    const leaderRes = await request('/auth/leaderboard', {
      headers: { Cookie: citizenCookie },
    });
    assert(leaderRes.status === 200 && Array.isArray(leaderRes.data.data), 'Leaderboard returns 200 with ranking list');

    const analyticsRes = await request('/admin/analytics', {
      headers: { Cookie: adminCookie },
    });
    assert(analyticsRes.status === 200 && Boolean(analyticsRes.data.data.totalIssues), 'Admin analytics returns real MongoDB metrics');

    // 12. Security - RBAC Enforcement
    console.log('\n--- 12. Security & RBAC Guardrails ---');
    // Citizen attempts admin-only endpoint
    const rbacRes = await request('/admin/users', {
      headers: { Cookie: citizenCookie },
    });
    assert(rbacRes.status === 403, 'Citizen blocked from admin endpoint with 403 Forbidden');

  } catch (err) {
    console.error('Unexpected error running integration tests:', err);
    testsFailed++;
  }

  console.log('\n========================================================');
  console.log(`   TEST VERIFICATION COMPLETE: ${testsPassed} PASSED | ${testsFailed} FAILED`);
  console.log('========================================================');
}

runTests();
