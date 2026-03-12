/**
 * Tests for F-01: Semantic HTML root structure
 * Verifies that index.html contains the required semantic elements,
 * ARIA attributes, and app sections.
 */

const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

beforeEach(() => {
  document.documentElement.innerHTML = html
    .replace(/^[\s\S]*<html[^>]*>/, '')
    .replace(/<\/html>[\s\S]*$/, '');
});

// ── Document-level ──────────────────────────────────────────────────────────

describe('Document metadata', () => {
  test('has charset UTF-8', () => {
    expect(html).toMatch(/charset=["']UTF-8["']/i);
  });

  test('has viewport meta tag', () => {
    expect(html).toMatch(/name=["']viewport["']/i);
  });

  test('has description meta tag', () => {
    expect(html).toMatch(/name=["']description["']/i);
  });

  test('has a non-empty <title>', () => {
    expect(html).toMatch(/<title>[^<]+<\/title>/i);
  });

  test('html element has lang attribute', () => {
    expect(html).toMatch(/<html[^>]+lang=/i);
  });
});

// ── Root app container ───────────────────────────────────────────────────────

describe('App root element', () => {
  test('has #app container', () => {
    const el = document.getElementById('app');
    expect(el).not.toBeNull();
  });

  test('#app has role="application"', () => {
    const el = document.getElementById('app');
    expect(el.getAttribute('role')).toBe('application');
  });

  test('#app has aria-label', () => {
    const el = document.getElementById('app');
    expect(el.getAttribute('aria-label')).toBeTruthy();
  });
});

// ── Header / Toolbar ─────────────────────────────────────────────────────────

describe('Header and toolbar', () => {
  test('has <header> with id="app-header"', () => {
    const el = document.getElementById('app-header');
    expect(el).not.toBeNull();
    expect(el.tagName.toLowerCase()).toBe('header');
  });

  test('header has role="banner"', () => {
    const el = document.getElementById('app-header');
    expect(el.getAttribute('role')).toBe('banner');
  });

  test('has app logo element #app-logo', () => {
    expect(document.getElementById('app-logo')).not.toBeNull();
  });

  test('has <nav> with id="app-toolbar"', () => {
    const nav = document.getElementById('app-toolbar');
    expect(nav).not.toBeNull();
    expect(nav.tagName.toLowerCase()).toBe('nav');
  });

  test('toolbar has aria-label', () => {
    const nav = document.getElementById('app-toolbar');
    expect(nav.getAttribute('aria-label')).toBeTruthy();
  });

  const toolbarButtons = [
    'btn-new',
    'btn-save',
    'btn-export-pdf',
    'btn-export-json',
    'btn-copy-html',
    'btn-toggle-theme',
    'btn-toggle-lang',
  ];

  toolbarButtons.forEach((id) => {
    test(`toolbar has button/element #${id}`, () => {
      expect(document.getElementById(id)).not.toBeNull();
    });
  });

  test('import JSON has a file input #input-import-json', () => {
    const input = document.getElementById('input-import-json');
    expect(input).not.toBeNull();
    expect(input.getAttribute('type')).toBe('file');
    expect(input.getAttribute('accept')).toBe('.json');
  });
});

// ── Status bar ───────────────────────────────────────────────────────────────

describe('Status bar', () => {
  test('has #app-status with role="status"', () => {
    const el = document.getElementById('app-status');
    expect(el).not.toBeNull();
    expect(el.getAttribute('role')).toBe('status');
  });

  test('#app-status has aria-live="polite"', () => {
    const el = document.getElementById('app-status');
    expect(el.getAttribute('aria-live')).toBe('polite');
  });

  test('has #status-text inside #app-status', () => {
    const text = document.getElementById('status-text');
    expect(text).not.toBeNull();
  });
});

// ── Main workspace ────────────────────────────────────────────────────────────

describe('Main workspace', () => {
  test('has <main> with id="app-workspace"', () => {
    const el = document.getElementById('app-workspace');
    expect(el).not.toBeNull();
    expect(el.tagName.toLowerCase()).toBe('main');
  });

  test('#app-workspace has role="main"', () => {
    const el = document.getElementById('app-workspace');
    expect(el.getAttribute('role')).toBe('main');
  });
});

// ── Editor panel ──────────────────────────────────────────────────────────────

describe('Editor panel', () => {
  test('has #editor-panel as <section>', () => {
    const el = document.getElementById('editor-panel');
    expect(el).not.toBeNull();
    expect(el.tagName.toLowerCase()).toBe('section');
  });

  test('#editor-panel has aria-label', () => {
    const el = document.getElementById('editor-panel');
    expect(el.getAttribute('aria-label')).toBeTruthy();
  });

  test('has #editor-tabs with role="tablist"', () => {
    const tabs = document.getElementById('editor-tabs');
    expect(tabs).not.toBeNull();
    expect(tabs.getAttribute('role')).toBe('tablist');
  });

  test('#editor-tabs has aria-label', () => {
    const tabs = document.getElementById('editor-tabs');
    expect(tabs.getAttribute('aria-label')).toBeTruthy();
  });

  test('has #editor-content container', () => {
    expect(document.getElementById('editor-content')).not.toBeNull();
  });

  const editorSections = [
    'personal',
    'summary',
    'experience',
    'education',
    'skills',
    'languages',
    'projects',
    'certifications',
    'optional',
  ];

  editorSections.forEach((name) => {
    describe(`Section: ${name}`, () => {
      test(`has tab button #tab-${name}`, () => {
        const tab = document.getElementById(`tab-${name}`);
        expect(tab).not.toBeNull();
        expect(tab.getAttribute('role')).toBe('tab');
      });

      test(`tab #tab-${name} has aria-controls pointing to #section-${name}`, () => {
        const tab = document.getElementById(`tab-${name}`);
        expect(tab.getAttribute('aria-controls')).toBe(`section-${name}`);
      });

      test(`has panel #section-${name} with role="tabpanel"`, () => {
        const panel = document.getElementById(`section-${name}`);
        expect(panel).not.toBeNull();
        expect(panel.getAttribute('role')).toBe('tabpanel');
      });

      test(`panel #section-${name} has aria-labelledby pointing to #tab-${name}`, () => {
        const panel = document.getElementById(`section-${name}`);
        expect(panel.getAttribute('aria-labelledby')).toBe(`tab-${name}`);
      });
    });
  });

  test('exactly one tab has aria-selected="true"', () => {
    const tabs = document.querySelectorAll('[role="tab"]');
    const selected = [...tabs].filter((t) => t.getAttribute('aria-selected') === 'true');
    expect(selected).toHaveLength(1);
  });

  test('first tab (#tab-personal) is selected by default', () => {
    const tab = document.getElementById('tab-personal');
    expect(tab.getAttribute('aria-selected')).toBe('true');
  });
});

// ── Preview panel ─────────────────────────────────────────────────────────────

describe('Preview panel', () => {
  test('has #preview-panel as <section>', () => {
    const el = document.getElementById('preview-panel');
    expect(el).not.toBeNull();
    expect(el.tagName.toLowerCase()).toBe('section');
  });

  test('#preview-panel has aria-label', () => {
    const el = document.getElementById('preview-panel');
    expect(el.getAttribute('aria-label')).toBeTruthy();
  });

  test('has #preview-toolbar', () => {
    expect(document.getElementById('preview-toolbar')).not.toBeNull();
  });

  test('has #template-selector with role="group"', () => {
    const el = document.getElementById('template-selector');
    expect(el).not.toBeNull();
    expect(el.getAttribute('role')).toBe('group');
  });

  test('#template-selector has aria-label', () => {
    const el = document.getElementById('template-selector');
    expect(el.getAttribute('aria-label')).toBeTruthy();
  });

  test('has #style-controls with role="group"', () => {
    const el = document.getElementById('style-controls');
    expect(el).not.toBeNull();
    expect(el.getAttribute('role')).toBe('group');
  });

  test('#style-controls has aria-label', () => {
    const el = document.getElementById('style-controls');
    expect(el.getAttribute('aria-label')).toBeTruthy();
  });

  test('has #preview-frame with role="document"', () => {
    const el = document.getElementById('preview-frame');
    expect(el).not.toBeNull();
    expect(el.getAttribute('role')).toBe('document');
  });

  test('#preview-frame has aria-label', () => {
    const el = document.getElementById('preview-frame');
    expect(el.getAttribute('aria-label')).toBeTruthy();
  });
});

// ── Structural containment ────────────────────────────────────────────────────

describe('Structural containment', () => {
  test('#app-header is inside #app', () => {
    const app = document.getElementById('app');
    const header = document.getElementById('app-header');
    expect(app.contains(header)).toBe(true);
  });

  test('#app-workspace is inside #app', () => {
    const app = document.getElementById('app');
    const main = document.getElementById('app-workspace');
    expect(app.contains(main)).toBe(true);
  });

  test('#editor-panel is inside #app-workspace', () => {
    const main = document.getElementById('app-workspace');
    const editor = document.getElementById('editor-panel');
    expect(main.contains(editor)).toBe(true);
  });

  test('#preview-panel is inside #app-workspace', () => {
    const main = document.getElementById('app-workspace');
    const preview = document.getElementById('preview-panel');
    expect(main.contains(preview)).toBe(true);
  });
});
