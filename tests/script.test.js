/**
 * Tests for F-01: Inline JavaScript IIFE module.
 * Verifies that index.html contains a proper IIFE and that tab switching works.
 */

const fs   = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

function extractScriptContent(htmlStr) {
  const match = htmlStr.match(/<script>([\s\S]*?)<\/script>/);
  return match ? match[1].trim() : '';
}

const scriptContent = extractScriptContent(html);

beforeEach(() => {
  document.documentElement.innerHTML = html
    .replace(/^[\s\S]*<html[^>]*>/, '')
    .replace(/<\/html>[\s\S]*$/, '');

  // Execute the inline IIFE in the jsdom global context
  // eslint-disable-next-line no-eval
  eval(scriptContent);
});

// ── Script structure ──────────────────────────────────────────────────────────

describe('Inline script structure', () => {
  test('<script> tag contains actual JavaScript (not just a placeholder comment)', () => {
    expect(scriptContent.length).toBeGreaterThan(50);
  });

  test('script uses IIFE pattern — (function', () => {
    expect(scriptContent).toMatch(/\(function\s*\(/);
  });

  test('script uses IIFE pattern — invoked immediately with ()', () => {
    expect(scriptContent).toMatch(/\}\s*\)\s*\(\s*\)\s*;/);
  });

  test('script declares strict mode', () => {
    expect(scriptContent).toContain("'use strict'");
  });
});

// ── Public API ────────────────────────────────────────────────────────────────

describe('CVStudio public API', () => {
  test('window.CVStudio is defined after init', () => {
    expect(window.CVStudio).toBeDefined();
  });

  test('window.CVStudio.activateTab is a function', () => {
    expect(typeof window.CVStudio.activateTab).toBe('function');
  });

  test('window.CVStudio.init is a function', () => {
    expect(typeof window.CVStudio.init).toBe('function');
  });
});

// ── Tab switching ─────────────────────────────────────────────────────────────

describe('Tab switching — activateTab()', () => {
  test('sets aria-selected="true" on the target tab', () => {
    window.CVStudio.activateTab('experience');
    expect(document.getElementById('tab-experience').getAttribute('aria-selected')).toBe('true');
  });

  test('removes hidden attribute from the target panel', () => {
    window.CVStudio.activateTab('experience');
    expect(document.getElementById('section-experience').hasAttribute('hidden')).toBe(false);
  });

  test('sets aria-selected="false" on previously active tab', () => {
    window.CVStudio.activateTab('education');
    expect(document.getElementById('tab-personal').getAttribute('aria-selected')).toBe('false');
  });

  test('adds hidden attribute to previously visible panel', () => {
    window.CVStudio.activateTab('education');
    expect(document.getElementById('section-personal').hasAttribute('hidden')).toBe(true);
  });

  test('only one tab has aria-selected="true" at a time', () => {
    window.CVStudio.activateTab('skills');
    const tabs = document.querySelectorAll('[role="tab"]');
    const selected = [...tabs].filter(t => t.getAttribute('aria-selected') === 'true');
    expect(selected).toHaveLength(1);
    expect(selected[0].id).toBe('tab-skills');
  });

  test('only one panel is visible at a time', () => {
    window.CVStudio.activateTab('languages');
    const panels = document.querySelectorAll('#editor-content [role="tabpanel"]');
    const visible = [...panels].filter(p => !p.hasAttribute('hidden'));
    expect(visible).toHaveLength(1);
    expect(visible[0].id).toBe('section-languages');
  });

  const sections = ['personal', 'summary', 'experience', 'education', 'skills', 'languages', 'projects', 'certifications', 'optional'];

  sections.forEach(function (name) {
    test('activates tab and panel for section: ' + name, () => {
      window.CVStudio.activateTab(name);
      expect(document.getElementById('tab-' + name).getAttribute('aria-selected')).toBe('true');
      expect(document.getElementById('section-' + name).hasAttribute('hidden')).toBe(false);
    });
  });
});

// ── Click delegation ──────────────────────────────────────────────────────────

describe('Tab click delegation', () => {
  test('clicking a tab button activates it', () => {
    document.getElementById('tab-projects').click();
    expect(document.getElementById('tab-projects').getAttribute('aria-selected')).toBe('true');
    expect(document.getElementById('section-projects').hasAttribute('hidden')).toBe(false);
  });

  test('clicking a tab hides the previously active panel', () => {
    document.getElementById('tab-certifications').click();
    expect(document.getElementById('section-personal').hasAttribute('hidden')).toBe(true);
  });
});
