#!/usr/bin/env node

/**
 * AlmostHack — Production Healthcheck Probe
 * Validates process vitality and readiness.
 */

const http = require('http');

const apiUrl = process.env.API_URL || 'http://127.0.0.1:4000';
const targetPath = process.argv[2] || '/health/live';

const url = new URL(targetPath, apiUrl);

const req = http.get(url.toString(), { timeout: 5000 }, (res) => {
  if (res.statusCode >= 200 && res.statusCode < 300) {
    console.log(`[HealthCheck] OK: ${url.toString()} returned HTTP ${res.statusCode}`);
    process.exit(0);
  } else {
    console.error(`[HealthCheck] FAILED: ${url.toString()} returned HTTP ${res.statusCode}`);
    process.exit(1);
  }
});

req.on('error', (err) => {
  console.error(`[HealthCheck] ERROR: Connection failed to ${url.toString()} - ${err.message}`);
  process.exit(1);
});

req.on('timeout', () => {
  req.destroy();
  console.error(`[HealthCheck] TIMEOUT: Request timed out after 5000ms`);
  process.exit(1);
});
