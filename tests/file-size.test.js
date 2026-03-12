/**
 * Tests that index.html stays under 500 KB.
 *
 * Because the app is a single self-contained file (no external assets),
 * the file size IS the total payload the user downloads. Keeping it under
 * 500 KB ensures fast load times even on slow connections.
 */

const fs   = require('fs');
const path = require('path');

const FILE_PATH    = path.join(__dirname, '..', 'index.html');
const MAX_BYTES    = 500 * 1024; // 500 KB
const MAX_LABEL    = '500 KB';

const stats = fs.statSync(FILE_PATH);
const html  = fs.readFileSync(FILE_PATH, 'utf8');

// ── File size ─────────────────────────────────────────────────────────────────

describe('File size', () => {
  test(`index.html is smaller than ${MAX_LABEL}`, () => {
    expect(stats.size).toBeLessThan(MAX_BYTES);
  });

  test('file is not empty', () => {
    expect(stats.size).toBeGreaterThan(0);
  });
});

// ── No external assets (guarantees file size = full app weight) ───────────────

describe('No external assets that would inflate total weight', () => {
  test('no external scripts via <script src>', () => {
    expect(html).not.toMatch(/<script[^>]+src=["']https?:/i);
  });

  test('no external stylesheets via <link href>', () => {
    expect(html).not.toMatch(/<link[^>]+href=["']https?:/i);
  });

  test('no external images via <img src>', () => {
    expect(html).not.toMatch(/<img[^>]+src=["']https?:/i);
  });

  test('no @font-face src pointing to an external URL', () => {
    expect(html).not.toMatch(/@font-face[\s\S]*?src\s*:[\s\S]*?https?:/i);
  });

  test('no external video or audio sources', () => {
    expect(html).not.toMatch(/<(?:video|audio|source)[^>]+src=["']https?:/i);
  });
});
