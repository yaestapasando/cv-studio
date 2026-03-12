/**
 * Tests for F-01 (CSS): inline reset, CSS variables, and layout styles.
 */

const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
const css = styleMatch ? styleMatch[1] : '';

// ── CSS presence ─────────────────────────────────────────────────────────────

describe('CSS presence', () => {
  test('<style> block exists', () => {
    expect(styleMatch).not.toBeNull();
  });

  test('<style> block contains substantial CSS (> 100 chars)', () => {
    expect(css.trim().length).toBeGreaterThan(100);
  });
});

// ── Reset ─────────────────────────────────────────────────────────────────────

describe('CSS Reset', () => {
  test('box-sizing: border-box applied universally', () => {
    expect(css).toMatch(/box-sizing\s*:\s*border-box/);
  });

  test('margin reset (margin: 0) is present', () => {
    expect(css).toMatch(/margin\s*:\s*0/);
  });

  test('padding reset (padding: 0) is present', () => {
    expect(css).toMatch(/padding\s*:\s*0/);
  });

  test('font: inherit applied to form elements', () => {
    expect(css).toMatch(/font\s*:\s*inherit/);
  });

  test('list-style reset is present', () => {
    expect(css).toMatch(/list-style\s*:\s*none/);
  });
});

// ── CSS Variables ─────────────────────────────────────────────────────────────

describe('CSS Variables', () => {
  test(':root block is defined', () => {
    expect(css).toMatch(/:root\s*\{/);
  });

  const vars = [
    '--color-bg',
    '--color-surface',
    '--color-surface-alt',
    '--color-border',
    '--color-text',
    '--color-text-muted',
    '--color-accent',
    '--color-accent-hover',
    '--color-accent-text',
    '--color-danger',
    '--font-ui',
    '--font-mono',
    '--font-size-sm',
    '--font-size-base',
    '--space-1',
    '--space-2',
    '--space-4',
    '--space-6',
    '--space-8',
    '--header-height',
    '--status-height',
    '--panel-min-width',
    '--radius-sm',
    '--radius-md',
    '--shadow-sm',
    '--shadow-md',
    '--transition',
  ];

  vars.forEach((v) => {
    test(`defines ${v}`, () => {
      expect(css).toContain(v);
    });
  });

  test('dark theme via prefers-color-scheme media query', () => {
    expect(css).toMatch(/@media\s*\(\s*prefers-color-scheme\s*:\s*dark\s*\)/);
  });

  test('[data-theme="dark"] override selector is defined', () => {
    expect(css).toMatch(/\[data-theme="dark"\]/);
  });

  test('[data-theme="light"] override selector is defined', () => {
    expect(css).toMatch(/\[data-theme="light"\]/);
  });
});

// ── Layout selectors ──────────────────────────────────────────────────────────

describe('Layout selectors', () => {
  const selectors = [
    '#app',
    '#app-header',
    '#app-logo',
    '#app-toolbar',
    '#app-status',
    '#app-workspace',
    '#editor-panel',
    '#editor-tabs',
    '#editor-content',
    '#preview-panel',
    '#preview-toolbar',
    '#preview-frame',
    '#template-selector',
    '#style-controls',
  ];

  selectors.forEach((sel) => {
    test(`has CSS rule for ${sel}`, () => {
      expect(css).toContain(sel);
    });
  });

  test('#app uses flex-direction: column', () => {
    const match = css.match(/#app\s*\{([^}]+)\}/);
    expect(match).not.toBeNull();
    expect(match[1]).toMatch(/flex-direction\s*:\s*column/);
  });

  test('#app-workspace uses display: flex', () => {
    const match = css.match(/#app-workspace\s*\{([^}]+)\}/);
    expect(match).not.toBeNull();
    expect(match[1]).toMatch(/display\s*:\s*flex/);
  });

  test('#editor-panel uses flex-direction: column', () => {
    const match = css.match(/#editor-panel\s*\{([^}]+)\}/);
    expect(match).not.toBeNull();
    expect(match[1]).toMatch(/flex-direction\s*:\s*column/);
  });

  test('#preview-panel uses display: flex', () => {
    const match = css.match(/#preview-panel\s*\{([^}]+)\}/);
    expect(match).not.toBeNull();
    expect(match[1]).toMatch(/display\s*:\s*flex/);
  });

  test('#editor-tabs uses overflow-x: auto for horizontal scroll', () => {
    const match = css.match(/#editor-tabs\s*\{([^}]+)\}/);
    expect(match).not.toBeNull();
    expect(match[1]).toMatch(/overflow-x\s*:\s*auto/);
  });
});

// ── Media queries ─────────────────────────────────────────────────────────────

describe('Media queries', () => {
  test('responsive breakpoint at max-width: 1024px', () => {
    expect(css).toMatch(/@media\s*\(\s*max-width\s*:\s*1024px\s*\)/);
  });

  test('prefers-reduced-motion: reduce is handled', () => {
    expect(css).toMatch(/@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/);
  });

  test('@media print block is present', () => {
    expect(css).toMatch(/@media\s+print/);
  });
});
