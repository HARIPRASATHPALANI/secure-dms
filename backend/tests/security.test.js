import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000/api';

const runTests = async () => {
  console.log('\n🧪 ==================================================');
  console.log('🧪 RUNNING AUTOMATED SYSTEM & SECURITY TEST SUITE');
  console.log('🧪 ==================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      failed++;
    }
  };

  try {
    // 1. Health Check
    const healthRes = await fetch(`${API_URL}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'ONLINE', 'TC-00: Backend Server Health Check');

    // 2. Valid Login
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'Admin@123' })
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && loginData.token, 'TC-01: Valid User Authentication (admin)');
    const token = loginData.token;

    // 3. Invalid Login
    const badLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'WrongPassword' })
    });
    assert(badLoginRes.status === 401, 'TC-02: Invalid Password Rejection (401 Unauthorized)');

    // 4. Fetch Cases
    const casesRes = await fetch(`${API_URL}/cases`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const casesData = await casesRes.json();
    assert(casesRes.status === 200 && Array.isArray(casesData.cases), 'TC-03: Authorized Fetch Cases Listing');

    // 5. Re-Auth Guard - Attempt 1 Failure
    const reauth1 = await fetch(`${API_URL}/security/verify-reauth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ username: 'admin', password: 'WrongPassword1', moduleName: 'UPDATE' })
    });
    const reauth1Data = await reauth1.json();
    assert(reauth1.status === 401 && reauth1Data.remainingAttempts === 1, 'TC-04: Re-Auth Attempt 1 Warning (1 attempt remaining)');

    // 6. Re-Auth Guard - Attempt 2 Failure & Telegram Alert Trigger
    const reauth2 = await fetch(`${API_URL}/security/verify-reauth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ username: 'admin', password: 'WrongPassword2', moduleName: 'UPDATE' })
    });
    const reauth2Data = await reauth2.json();
    assert(
      reauth2.status === 403 && reauth2Data.alertTriggered === true,
      'TC-05: Re-Auth Attempt 2 Security Alert Lockout & Telegram Alert Dispatch'
    );

    // 7. Re-Auth Guard - Valid Credentials
    const reauthValid = await fetch(`${API_URL}/security/verify-reauth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ username: 'admin', password: 'Admin@123', moduleName: 'NEW_CASE' })
    });
    const reauthValidData = await reauthValid.json();
    assert(reauthValid.status === 200 && reauthValidData.reauthToken, 'TC-06: Valid Secondary Re-Authentication (reauthToken issued)');

    // 8. Create Case with Re-Auth Token
    const testCaseId = `TEST-CASE-${Date.now()}`;
    const createCaseRes = await fetch(`${API_URL}/cases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'x-reauth-token': reauthValidData.reauthToken
      },
      body: JSON.stringify({
        case_id: testCaseId,
        case_name: 'Automated Test Case Entry',
        case_type: 'Cybercrime',
        status: 'OPEN',
        priority: 'HIGH',
        location: 'Test Lab HQ',
        description: 'Test case generated during security suite run.'
      })
    });
    const createCaseData = await createCaseRes.json();
    assert(createCaseRes.status === 201 && createCaseData.case.case_id === testCaseId, 'TC-07: Protected Case Creation');

    // 9. Duplicate Case ID Prevention
    const dupCaseRes = await fetch(`${API_URL}/cases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'x-reauth-token': reauthValidData.reauthToken
      },
      body: JSON.stringify({
        case_id: testCaseId,
        case_name: 'Duplicate Case Attempt',
        case_type: 'Cybercrime',
        status: 'OPEN',
        priority: 'HIGH',
        location: 'Test Lab HQ'
      })
    });
    assert(dupCaseRes.status === 400, 'TC-08: Duplicate Case ID Rejection (400 Bad Request)');

    // 10. Audit Logs Inspection
    const auditRes = await fetch(`${API_URL}/audit-logs`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const auditData = await auditRes.json();
    assert(auditRes.status === 200 && auditData.logs.length > 0, 'TC-09: Forensic Audit Trail Retrieval');

  } catch (err) {
    console.error('❌ Test execution exception:', err.message);
  }

  console.log('\n==================================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('==================================================\n');

  if (failed > 0) process.exit(1);
  else process.exit(0);
};

runTests();
