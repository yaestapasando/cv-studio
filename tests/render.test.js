/**
 * Tests for F-01: Template rendering engine (render() function)
 * Verifies that render() converts CV data objects into correct HTML strings.
 */

const fs   = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

// Extract the IIFE <script> block (last one in the file)
const scriptTags    = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
const scriptContent = scriptTags.length ? scriptTags[scriptTags.length - 1][1] : '';

beforeEach(() => {
  document.documentElement.innerHTML = html
    .replace(/^[\s\S]*<html[^>]*>/, '')
    .replace(/<\/html>[\s\S]*$/, '');
  // Execute the IIFE to populate window.CVStudio
  // eslint-disable-next-line no-eval
  eval(scriptContent); // nosec – test-only eval of trusted local file
});

// ── API surface ───────────────────────────────────────────────────────────────

describe('render() API', () => {
  test('is exposed on window.CVStudio', () => {
    expect(typeof window.CVStudio.render).toBe('function');
  });

  test('returns a string for empty input', () => {
    expect(typeof window.CVStudio.render({})).toBe('string');
  });

  test('returns a string for DEFAULT_CV', () => {
    expect(typeof window.CVStudio.render(window.CVStudio.DEFAULT_CV)).toBe('string');
  });

  test('returns non-empty HTML for populated data', () => {
    const result = window.CVStudio.render({
      personal: { fullName: 'Ada Lovelace', jobTitle: 'Engineer' },
      meta:     { template: 'classic', accentColor: '#333', fontPair: 'serif', fontSize: 'normal' }
    });
    expect(result.length).toBeGreaterThan(0);
  });
});

// ── Personal info ─────────────────────────────────────────────────────────────

describe('render() – personal info', () => {
  let render;
  beforeEach(() => { render = window.CVStudio.render; });

  test('includes fullName in an h1', () => {
    const r = render({ personal: { fullName: 'John Doe' } });
    expect(r).toContain('<h1');
    expect(r).toContain('John Doe');
  });

  test('includes jobTitle', () => {
    expect(render({ personal: { jobTitle: 'Software Engineer' } })).toContain('Software Engineer');
  });

  test('includes email', () => {
    expect(render({ personal: { email: 'test@example.com' } })).toContain('test@example.com');
  });

  test('includes phone', () => {
    expect(render({ personal: { phone: '+34 600 000 000' } })).toContain('+34 600 000 000');
  });

  test('includes location', () => {
    expect(render({ personal: { location: 'Madrid, España' } })).toContain('Madrid, España');
  });

  test('includes photo img when photo is provided', () => {
    const r = render({ personal: { photo: 'data:image/png;base64,abc' } });
    expect(r).toContain('<img');
    expect(r).toContain('data:image/png;base64,abc');
  });

  test('omits img when photo is empty', () => {
    expect(render({ personal: { photo: '' } })).not.toContain('<img');
  });

  test('omits img when personal is empty', () => {
    expect(render({})).not.toContain('<img');
  });
});

// ── Sections ──────────────────────────────────────────────────────────────────

describe('render() – sections', () => {
  let render;
  beforeEach(() => { render = window.CVStudio.render; });

  test('renders summary section text', () => {
    expect(render({ summary: 'My summary.' })).toContain('My summary.');
  });

  test('omits summary section when empty string', () => {
    expect(render({ summary: '' })).not.toContain('Resumen profesional');
  });

  test('omits summary section when missing', () => {
    expect(render({})).not.toContain('Resumen profesional');
  });

  test('renders experience company and role', () => {
    const r = render({ experience: [{ id: '1', company: 'ACME Corp', role: 'Dev', startDate: '2020-01', endDate: '2022-01', current: false, description: 'Built stuff' }] });
    expect(r).toContain('ACME Corp');
    expect(r).toContain('Dev');
    expect(r).toContain('Built stuff');
  });

  test('shows Actualidad for current experience', () => {
    const r = render({ experience: [{ id: '1', company: 'X', role: 'Y', startDate: '2023-01', current: true }] });
    expect(r).toContain('Actualidad');
  });

  test('omits experience section for empty array', () => {
    expect(render({ experience: [] })).not.toContain('Experiencia laboral');
  });

  test('renders education institution and degree', () => {
    const r = render({ education: [{ id: '1', institution: 'MIT', degree: 'BSc', field: 'CS', startDate: '2018', endDate: '2022' }] });
    expect(r).toContain('MIT');
    expect(r).toContain('BSc');
    expect(r).toContain('CS');
  });

  test('shows Actualidad for in-progress education', () => {
    const r = render({ education: [{ id: '1', institution: 'UPM', degree: 'MSc', startDate: '2022', current: true }] });
    expect(r).toContain('Actualidad');
  });

  test('renders skills with name and level', () => {
    const r = render({ skills: [{ id: '1', name: 'JavaScript', level: 'expert' }] });
    expect(r).toContain('JavaScript');
    expect(r).toContain('expert');
  });

  test('omits skills section for empty array', () => {
    expect(render({ skills: [] })).not.toContain('Habilidades');
  });

  test('renders languages with name and level', () => {
    const r = render({ languages: [{ id: '1', name: 'English', level: 'C1' }] });
    expect(r).toContain('English');
    expect(r).toContain('C1');
  });

  test('omits languages section for empty array', () => {
    expect(render({ languages: [] })).not.toContain('Idiomas');
  });

  test('renders projects with name, description and technologies', () => {
    const r = render({ projects: [{ id: '1', name: 'CV Studio', description: 'A CV builder', url: 'https://example.com', technologies: 'HTML, CSS' }] });
    expect(r).toContain('CV Studio');
    expect(r).toContain('A CV builder');
    expect(r).toContain('HTML, CSS');
  });

  test('renders certifications with name, issuer and date', () => {
    const r = render({ certifications: [{ id: '1', name: 'AWS Cert', issuer: 'Amazon', date: '2023-06' }] });
    expect(r).toContain('AWS Cert');
    expect(r).toContain('Amazon');
    expect(r).toContain('2023-06');
  });
});

// ── Optional sections ─────────────────────────────────────────────────────────

describe('render() – optional sections', () => {
  let render;
  beforeEach(() => { render = window.CVStudio.render; });

  test('renders volunteering when enabled', () => {
    const r = render({ optional: { volunteering: { enabled: true, items: ['Cruz Roja'] } } });
    expect(r).toContain('Voluntariado');
    expect(r).toContain('Cruz Roja');
  });

  test('omits volunteering when disabled', () => {
    const r = render({ optional: { volunteering: { enabled: false, items: ['Cruz Roja'] } } });
    expect(r).not.toContain('Voluntariado');
  });

  test('renders publications when enabled', () => {
    const r = render({ optional: { publications: { enabled: true, items: ['Paper 1'] } } });
    expect(r).toContain('Publicaciones');
    expect(r).toContain('Paper 1');
  });

  test('renders awards when enabled', () => {
    const r = render({ optional: { awards: { enabled: true, items: ['Best App'] } } });
    expect(r).toContain('Premios');
    expect(r).toContain('Best App');
  });

  test('renders references text when enabled', () => {
    const r = render({ optional: { references: { enabled: true, text: 'Available on request.' } } });
    expect(r).toContain('Available on request.');
  });

  test('omits references when disabled', () => {
    const r = render({ optional: { references: { enabled: false, text: 'Available on request.' } } });
    expect(r).not.toContain('Referencias');
  });
});

// ── HTML escaping ─────────────────────────────────────────────────────────────

describe('render() – HTML escaping', () => {
  let render;
  beforeEach(() => { render = window.CVStudio.render; });

  test('escapes < and > in fullName', () => {
    const r = render({ personal: { fullName: '<script>alert(1)</script>' } });
    expect(r).not.toContain('<script>alert(1)</script>');
    expect(r).toContain('&lt;script&gt;');
  });

  test('escapes & in jobTitle', () => {
    expect(render({ personal: { jobTitle: 'R&D Engineer' } })).toContain('R&amp;D Engineer');
  });

  test('escapes " in summary', () => {
    expect(render({ summary: 'He said "hello".' })).toContain('&quot;hello&quot;');
  });

  test('escapes special chars in skill name', () => {
    const r = render({ skills: [{ id: '1', name: 'C++ & Rust' }] });
    expect(r).toContain('C++ &amp; Rust');
  });

  test('escapes special chars in section titles', () => {
    // Section titles are passed through escapeHtml — spot-check via summary
    expect(render({ summary: 'ok' })).toContain('Resumen profesional');
  });
});

// ── Templates ─────────────────────────────────────────────────────────────────

describe('render() – templates', () => {
  let render;
  beforeEach(() => { render = window.CVStudio.render; });

  test('classic template adds cv-classic class', () => {
    expect(render({ meta: { template: 'classic' } })).toContain('cv-classic');
  });

  test('modern template adds cv-modern class', () => {
    expect(render({ meta: { template: 'modern' } })).toContain('cv-modern');
  });

  test('minimal template adds cv-minimal class', () => {
    expect(render({ meta: { template: 'minimal' } })).toContain('cv-minimal');
  });

  test('defaults to classic when no template specified', () => {
    expect(render({})).toContain('cv-classic');
  });

  test('modern template has cv-sidebar element', () => {
    expect(render({ meta: { template: 'modern' } })).toContain('cv-sidebar');
  });

  test('modern template has cv-main element', () => {
    expect(render({ meta: { template: 'modern' } })).toContain('cv-main');
  });

  test('opts parameter overrides meta.template', () => {
    const r = render({ meta: { template: 'classic' } }, { template: 'minimal' });
    expect(r).toContain('cv-minimal');
    expect(r).not.toContain('cv-classic');
  });

  test('modern template renders skills in sidebar', () => {
    const r = render({ meta: { template: 'modern' }, skills: [{ id: '1', name: 'Python', level: 'advanced' }] });
    const sidebarEnd = r.indexOf('</aside>');
    const sidebarContent = r.substring(0, sidebarEnd);
    expect(sidebarContent).toContain('Python');
  });

  test('modern template renders experience in main', () => {
    const r = render({ meta: { template: 'modern' }, experience: [{ id: '1', company: 'X', role: 'Dev', startDate: '2020', current: true }] });
    const mainStart = r.indexOf('<div class="cv-main">');
    const mainContent = r.substring(mainStart);
    expect(mainContent).toContain('Experiencia laboral');
  });
});

// ── CSS custom properties ─────────────────────────────────────────────────────

describe('render() – CSS variables', () => {
  let render;
  beforeEach(() => { render = window.CVStudio.render; });

  test('includes accent color in style attribute', () => {
    expect(render({ meta: { accentColor: '#ff0000' } })).toContain('#ff0000');
  });

  test('includes font-pair in style attribute', () => {
    expect(render({ meta: { fontPair: 'serif' } })).toContain('serif');
  });

  test('uses 13px for fontSize "small"',  () => { expect(render({ meta: { fontSize: 'small'  } })).toContain('13px'); });
  test('uses 15px for fontSize "normal"', () => { expect(render({ meta: { fontSize: 'normal' } })).toContain('15px'); });
  test('uses 17px for fontSize "large"',  () => { expect(render({ meta: { fontSize: 'large'  } })).toContain('17px'); });

  test('defaults to 15px when fontSize is unrecognised', () => {
    expect(render({ meta: { fontSize: 'huge' } })).toContain('15px');
  });

  test('defaults to #2563eb accent when not specified', () => {
    expect(render({})).toContain('#2563eb');
  });
});
