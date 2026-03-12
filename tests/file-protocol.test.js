/**
 * Tests for file:// protocol compatibility.
 * Validates that index.html can be opened directly in Chrome, Firefox, and Safari
 * without a web server (file:// protocol).
 *
 * Constraints for file:// compatibility:
 *  - No external resources (CDN scripts, fonts, stylesheets) — requires network
 *  - No <script type="module"> — CORS-blocked under file:// in all major browsers
 *  - No fetch() / XMLHttpRequest / WebSocket — require network or a server
 *  - No Service Workers — not supported under file://
 *  - No document.cookie — cookies are not available under file://
 *  - All CSS and JS must be inline so the file is self-contained
 *  - Initialization must handle file:// load timing (readyState already interactive/complete)
 */

const fs   = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

// ── External resource dependencies ───────────────────────────────────────────

describe('No external resource dependencies', () => {
  test('no <script src="..."> tags (JS must be inline)', () => {
    // External scripts require network or relative files; both break file:// portability
    expect(html).not.toMatch(/<script[^>]+src=/i);
  });

  test('no <link rel="stylesheet"> tags (CSS must be inline)', () => {
    expect(html).not.toMatch(/<link[^>]+rel=["']stylesheet["']/i);
  });

  test('no external <img src> in app shell (no http/https URLs)', () => {
    // CV photos are injected at runtime, not hardcoded in the app shell
    expect(html).not.toMatch(/<img[^>]+src=["']https?:/i);
  });

  test('no Google Fonts or other external font service', () => {
    expect(html).not.toMatch(/fonts\.googleapis\.com/i);
    expect(html).not.toMatch(/fonts\.gstatic\.com/i);
  });

  test('no @import url() pointing to external resources', () => {
    expect(html).not.toMatch(/@import\s+url\(["']?https?:/i);
  });
});

// ── ES module scripts ─────────────────────────────────────────────────────────

describe('No ES module scripts', () => {
  test('no <script type="module"> (CORS-blocked under file://)', () => {
    // Browsers block module scripts loaded via file:// due to CORS restrictions
    expect(html).not.toMatch(/<script[^>]+type=["']module["']/i);
  });
});

// ── Network-dependent APIs ────────────────────────────────────────────────────

describe('No network-dependent APIs', () => {
  test('no fetch() calls', () => {
    // fetch() is blocked or unavailable under file:// in most browsers
    expect(html).not.toMatch(/\bfetch\s*\(/);
  });

  test('no XMLHttpRequest usage', () => {
    expect(html).not.toMatch(/\bnew\s+XMLHttpRequest\s*\(/);
  });

  test('no WebSocket usage', () => {
    // WebSockets require a ws:// or wss:// server; not available under file://
    expect(html).not.toMatch(/\bnew\s+WebSocket\s*\(/);
  });
});

// ── Browser APIs unavailable under file:// ───────────────────────────────────

describe('No browser APIs unavailable under file://', () => {
  test('no Service Worker registration', () => {
    // Service Workers are not supported under file:// in any browser
    expect(html).not.toMatch(/navigator\.serviceWorker/);
  });

  test('no document.cookie usage', () => {
    // Cookies are blocked under file:// in Chrome and Firefox
    expect(html).not.toMatch(/\bdocument\.cookie\b/);
  });
});

// ── Self-contained structure ──────────────────────────────────────────────────

describe('Self-contained structure', () => {
  test('has at least one inline <style> block (no external CSS)', () => {
    expect(html).toMatch(/<style[\s>]/i);
  });

  test('has at least one inline <script> block (no external JS)', () => {
    expect(html).toMatch(/<script[\s>]/i);
  });

  test('DOCTYPE declaration is present', () => {
    expect(html).toMatch(/^<!DOCTYPE\s+html/i);
  });

  test('charset UTF-8 declared (required for correct rendering under file://)', () => {
    // Without charset, browsers may misinterpret non-ASCII characters
    expect(html).toMatch(/charset=["']?UTF-8["']?/i);
  });
});

// ── Initialization timing ─────────────────────────────────────────────────────

describe('Safe initialization for file:// load timing', () => {
  test('guards init with document.readyState check', () => {
    // Under file://, the script at end-of-body runs when readyState is already
    // "interactive" or "complete", so DOMContentLoaded may never fire.
    // The app must branch on readyState.
    expect(html).toMatch(/document\.readyState/);
  });

  test('falls back to DOMContentLoaded when document is still loading', () => {
    expect(html).toMatch(/DOMContentLoaded/);
  });

  test('calls init() directly when document is not in loading state', () => {
    // This is the path taken under file:// (readyState === 'complete')
    expect(html).toMatch(/}\s*else\s*\{[\s\S]{0,30}init\s*\(\s*\)/);
  });
});
