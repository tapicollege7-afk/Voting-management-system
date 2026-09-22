const assert = require('assert');

const BASE_URL = 'http://localhost:3000';

async function runSystemApiTests() {
  console.log('\n--- Running System & Production Environment Tests ---');
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}: ${err.message}`);
      failed++;
    }
  }

  // 1. Health Endpoint
  await test('GET /api/health returns operational status and system details', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.status, 'ok');
    assert.ok(data.system.includes('VotePulse'));
    assert.ok(data.stats);
  });

  // 2. PWA Service Worker Scope
  await test('GET /sw.js is served at root scope with correct headers', async () => {
    const res = await fetch(`${BASE_URL}/sw.js`);
    assert.strictEqual(res.status, 200);
    const contentType = res.headers.get('content-type') || '';
    assert.ok(contentType.includes('javascript'), `Expected javascript content-type, got: ${contentType}`);
    const text = await res.text();
    assert.ok(text.includes('CACHE_NAME') || text.includes('install') || text.includes('fetch'));
  });

  // 3. Web App Manifest
  await test('GET /manifest.json is accessible and valid JSON', async () => {
    const res = await fetch(`${BASE_URL}/manifest.json`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.name || data.short_name);
    assert.ok(data.icons);
  });

  // 4. SPA HTML Serving for Root & Named Routes
  await test('GET / serves single page application HTML shell', async () => {
    const res = await fetch(`${BASE_URL}/`);
    assert.strictEqual(res.status, 200);
    const html = await res.text();
    assert.ok(html.includes('<div id="root">') || html.includes('VotePulse'));
  });

  await test('GET /admin redirects cleanly to /#admin', async () => {
    const res = await fetch(`${BASE_URL}/admin`, { redirect: 'manual' });
    assert.strictEqual(res.status, 302);
    assert.strictEqual(res.headers.get('location'), '/#admin');
  });

  await test('GET /candidate redirects cleanly to /#candidate', async () => {
    const res = await fetch(`${BASE_URL}/candidate`, { redirect: 'manual' });
    assert.strictEqual(res.status, 302);
    assert.strictEqual(res.headers.get('location'), '/#candidate');
  });

  await test('GET /audit redirects cleanly to /#audit', async () => {
    const res = await fetch(`${BASE_URL}/audit`, { redirect: 'manual' });
    assert.strictEqual(res.status, 302);
    assert.strictEqual(res.headers.get('location'), '/#audit');
  });

  // 5. Database Info Endpoint
  await test('GET /api/admin/db-info returns collections metadata', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/db-info`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.metadata.engine);
    assert.ok(data.metadata.collections);
  });

  // 6. Unknown API 404 Handler
  await test('GET /api/unknown-endpoint returns 404 JSON', async () => {
    const res = await fetch(`${BASE_URL}/api/unknown-endpoint-test-404`);
    const data = await res.json();
    assert.strictEqual(res.status, 404);
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.message, 'API endpoint not found.');
  });

  console.log(`System API Tests Completed: ${passed} passed, ${failed} failed.`);
  return { passed, failed };
}

module.exports = { runSystemApiTests };

if (require.main === module) {
  runSystemApiTests().then(({ failed }) => {
    process.exit(failed > 0 ? 1 : 0);
  });
}
