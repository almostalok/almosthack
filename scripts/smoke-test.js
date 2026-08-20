#!/usr/bin/env node

/**
 * AlmostHack — Production & Staging Deployment Smoke Test Suite
 * Validates authoritative end-to-end functionality safely and non-destructively.
 */

const http = require('http');
const https = require('https');

const API_BASE = process.env.API_URL || 'http://127.0.0.1:4000';
const isHttps = API_BASE.startsWith('https');
const client = isHttps ? https : http;

let sessionCookie = '';
let requestCounter = 0;

async function request(method, path, body = null, extraHeaders = {}) {
  requestCounter++;
  const url = new URL(path, API_BASE);
  const headers = {
    'Content-Type': 'application/json',
    'X-Request-ID': `smoke_req_${Date.now()}_${requestCounter}`,
    ...extraHeaders,
  };

  if (sessionCookie) {
    headers['Cookie'] = sessionCookie;
  }

  return new Promise((resolve, reject) => {
    const req = client.request(
      url.toString(),
      {
        method,
        headers,
        timeout: 10000,
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          const setCookie = res.headers['set-cookie'];
          if (setCookie && setCookie.length > 0) {
            sessionCookie = setCookie[0].split(';')[0];
          }

          let json = null;
          try {
            json = JSON.parse(rawData);
          } catch (e) {
            json = rawData;
          }

          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: json,
          });
        });
      }
    );

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request to ${url.toString()} timed out after 10000ms`));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runSmokeTests() {
  console.log('============================================================');
  console.log(`ALMOSTHACK DEPLOYMENT SMOKE TEST — Target: ${API_BASE}`);
  console.log('============================================================\n');

  let passed = 0;
  let failed = 0;

  async function step(name, fn) {
    process.stdout.write(`• ${name}... `);
    try {
      await fn();
      console.log('✅ PASS');
      passed++;
    } catch (err) {
      console.log(`❌ FAIL: ${err.message}`);
      failed++;
    }
  }

  // 1. Health Liveness Probe
  await step('1. Liveness Probe (GET /health/live)', async () => {
    const res = await request('GET', '/health/live');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (res.data.status !== 'ok') throw new Error(`Expected status ok, got ${res.data.status}`);
    if (!res.headers['x-request-id']) throw new Error('Missing X-Request-ID header');
  });

  // 2. Health Readiness Probe
  await step('2. Readiness Probe (GET /health/ready)', async () => {
    const res = await request('GET', '/health/ready');
    if (res.status !== 200 && res.status !== 503) {
      throw new Error(`Unexpected readiness status: ${res.status}`);
    }
    if (res.status === 200 && res.data.status !== 'ok') {
      throw new Error('Readiness status is not ok');
    }
  });

  // 3. Build & Version Metadata
  await step('3. Version Metadata (GET /health/version)', async () => {
    const res = await request('GET', '/health/version');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.data.version) throw new Error('Missing version field');
    if (!res.data.environment) throw new Error('Missing environment field');
  });

  // 4. Metrics & Telemetry
  await step('4. Metrics Collection (GET /metrics)', async () => {
    const res = await request('GET', '/metrics');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (typeof res.data.uptimeSeconds !== 'number') throw new Error('Missing uptimeSeconds metric');
  });

  // 5. User Registration & Session Auth Flow
  const testEmail = `smoke_${Date.now()}@almosthack.test`;
  const testPassword = 'Password123!';
  let userId = '';

  await step('5. Authentication Register Flow (POST /api/v1/auth/register)', async () => {
    const res = await request('POST', '/api/v1/auth/register', {
      email: testEmail,
      password: testPassword,
      name: 'Smoke Test Engineer',
    });
    if (res.status !== 201) throw new Error(`Registration failed with status ${res.status}: ${JSON.stringify(res.data)}`);
    if (!res.data.data?.user?.id) throw new Error('Missing user ID in response');
    userId = res.data.data.user.id;
  });

  // 6. User Profile Retrieval
  await step('6. Authenticated User Profile (GET /api/v1/users/me)', async () => {
    const res = await request('GET', '/api/v1/users/me');
    if (res.status !== 200) throw new Error(`Failed to fetch /users/me: ${res.status}`);
    if (res.data.data?.email !== testEmail) throw new Error('Email mismatch in profile');
  });

  // 7. Organization Lifecycle
  let orgId = '';
  const orgSlug = `smoke-org-${Date.now()}`;
  await step('7. Organization Creation (POST /api/v1/organizations)', async () => {
    const res = await request('POST', '/api/v1/organizations', {
      name: 'Smoke Test Org',
      slug: orgSlug,
    });
    if (res.status !== 201) throw new Error(`Failed to create org: ${res.status}: ${JSON.stringify(res.data)}`);
    orgId = res.data.data.id;
  });

  // 8. Hackathon Domain Lifecycle
  let hackathonId = '';
  const hackathonSlug = `smoke-hack-${Date.now()}`;
  await step('8. Hackathon Creation (POST /api/v1/hackathons)', async () => {
    const start = new Date(Date.now() + 86400000).toISOString();
    const end = new Date(Date.now() + 172800000).toISOString();
    const res = await request('POST', '/api/v1/hackathons', {
      organizationId: orgId,
      title: 'Smoke Test Hackathon',
      slug: hackathonSlug,
      startsAt: start,
      endsAt: end,
    });
    if (res.status !== 201) throw new Error(`Failed to create hackathon: ${res.status}: ${JSON.stringify(res.data)}`);
    hackathonId = res.data.data.id;
  });

  // 9. Hackathon Rules Retrieval
  await step('9. Hackathon Rules Retrieval (GET /api/v1/hackathons/:id/rules)', async () => {
    const res = await request('GET', `/api/v1/hackathons/${hackathonId}/rules`);
    if (res.status !== 200) throw new Error(`Failed to fetch rules: ${res.status}`);
  });

  // 10. Notifications Preferences
  await step('10. Notifications Preferences (GET /api/v1/notifications/preferences)', async () => {
    const res = await request('GET', '/api/v1/notifications/preferences');
    if (res.status !== 200) throw new Error(`Failed to fetch notification preferences: ${res.status}`);
  });

  // Summary
  console.log('\n============================================================');
  console.log(`SMOKE TEST SUMMARY: ${passed} passed, ${failed} failed`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🚀 All smoke tests passed successfully!');
    process.exit(0);
  }
}

runSmokeTests().catch((err) => {
  console.error(`Fatal smoke test execution error: ${err.stack || err.message}`);
  process.exit(1);
});
