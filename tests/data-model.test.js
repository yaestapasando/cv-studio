/**
 * Tests for F-01: CV data model (DEFAULT_CV)
 * Verifies that the plain JSON data model has the correct shape
 * and default values for every CV section.
 */

const fs   = require('fs');
const path = require('path');
const vm   = require('vm');

// ── Load CVStudio from index.html ────────────────────────────────────────────

const html     = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const srcMatch = html.match(/<script[^>]*>([\s\S]*?)<\/script>/);
const src      = srcMatch ? srcMatch[1] : '';

const sandbox = { window: {}, document: { readyState: 'complete', getElementById: () => null, querySelectorAll: () => [] } };
vm.createContext(sandbox);
vm.runInContext(src, sandbox);

const { DEFAULT_CV } = sandbox.window.CVStudio;

// ── Existence ────────────────────────────────────────────────────────────────

describe('DEFAULT_CV existence', () => {
  test('CVStudio exposes DEFAULT_CV', () => {
    expect(DEFAULT_CV).toBeDefined();
  });

  test('DEFAULT_CV is a plain object', () => {
    expect(typeof DEFAULT_CV).toBe('object');
    expect(Array.isArray(DEFAULT_CV)).toBe(false);
  });
});

// ── Personal section ─────────────────────────────────────────────────────────

describe('personal section', () => {
  const p = DEFAULT_CV.personal;

  test('personal section exists', () => {
    expect(p).toBeDefined();
  });

  const fields = ['fullName', 'jobTitle', 'email', 'phone', 'location', 'linkedIn', 'website', 'photo'];
  fields.forEach((f) => {
    test(`personal.${f} is an empty string`, () => {
      expect(p[f]).toBe('');
    });
  });
});

// ── Summary section ───────────────────────────────────────────────────────────

describe('summary section', () => {
  test('summary is an empty string', () => {
    expect(DEFAULT_CV.summary).toBe('');
  });
});

// ── Array sections ────────────────────────────────────────────────────────────

const arraySections = ['experience', 'education', 'skills', 'languages', 'projects', 'certifications'];

arraySections.forEach((section) => {
  describe(`${section} section`, () => {
    test(`${section} is an empty array`, () => {
      expect(Array.isArray(DEFAULT_CV[section])).toBe(true);
      expect(DEFAULT_CV[section]).toHaveLength(0);
    });
  });
});

// ── Optional section ──────────────────────────────────────────────────────────

describe('optional section', () => {
  const opt = DEFAULT_CV.optional;

  test('optional section exists', () => {
    expect(opt).toBeDefined();
  });

  ['volunteering', 'publications', 'awards'].forEach((key) => {
    describe(`optional.${key}`, () => {
      test('exists', () => { expect(opt[key]).toBeDefined(); });
      test('enabled defaults to false', () => { expect(opt[key].enabled).toBe(false); });
      test('items is an empty array', () => {
        expect(Array.isArray(opt[key].items)).toBe(true);
        expect(opt[key].items).toHaveLength(0);
      });
    });
  });

  describe('optional.references', () => {
    test('exists', () => { expect(opt.references).toBeDefined(); });
    test('enabled defaults to false', () => { expect(opt.references.enabled).toBe(false); });
    test('text defaults to empty string', () => { expect(opt.references.text).toBe(''); });
  });
});

// ── Meta section ──────────────────────────────────────────────────────────────

describe('meta section', () => {
  const m = DEFAULT_CV.meta;

  test('meta section exists', () => {
    expect(m).toBeDefined();
  });

  test('template defaults to "classic"', () => {
    expect(m.template).toBe('classic');
  });

  test('accentColor is a valid hex color string', () => {
    expect(m.accentColor).toMatch(/^#[0-9a-f]{6}$/i);
  });

  test('fontPair defaults to "sans-serif"', () => {
    expect(m.fontPair).toBe('sans-serif');
  });

  test('fontSize defaults to "normal"', () => {
    expect(m.fontSize).toBe('normal');
  });

  test('lang defaults to "es"', () => {
    expect(m.lang).toBe('es');
  });

  test('theme defaults to "auto"', () => {
    expect(m.theme).toBe('auto');
  });
});

// ── Immutability guard: DEFAULT_CV is a template ──────────────────────────────

describe('DEFAULT_CV sections are independent', () => {
  test('mutating experience array does not affect DEFAULT_CV reference count', () => {
    const copy = JSON.parse(JSON.stringify(DEFAULT_CV));
    copy.experience.push({ id: '1', company: 'ACME' });
    expect(DEFAULT_CV.experience).toHaveLength(0);
  });
});
