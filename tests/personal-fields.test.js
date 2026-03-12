/**
 * Tests for F-02: Personal section — full name field
 * Verifies DOM structure, store initialisation, and bidirectional binding.
 */

const fs   = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

const scriptTags    = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
const scriptContent = scriptTags.length ? scriptTags[scriptTags.length - 1][1] : '';

beforeEach(() => {
  document.documentElement.innerHTML = html
    .replace(/^[\s\S]*<html[^>]*>/, '')
    .replace(/<\/html>[\s\S]*$/, '');
  // eslint-disable-next-line no-eval
  eval(scriptContent); // nosec – test-only eval of trusted local file
});

// ── DOM structure ─────────────────────────────────────────────────────────────

describe('full name field – DOM structure', () => {
  test('#form-personal exists inside #section-personal', () => {
    const section = document.getElementById('section-personal');
    expect(section).not.toBeNull();
    const form = section.querySelector('#form-personal');
    expect(form).not.toBeNull();
  });

  test('#field-fullName input exists', () => {
    expect(document.getElementById('field-fullName')).not.toBeNull();
  });

  test('#field-fullName is type="text"', () => {
    expect(document.getElementById('field-fullName').type).toBe('text');
  });

  test('#field-fullName has name="fullName"', () => {
    expect(document.getElementById('field-fullName').name).toBe('fullName');
  });

  test('#field-fullName has autocomplete="name"', () => {
    expect(document.getElementById('field-fullName').getAttribute('autocomplete')).toBe('name');
  });

  test('#field-fullName has maxlength="120"', () => {
    expect(document.getElementById('field-fullName').getAttribute('maxlength')).toBe('120');
  });

  test('label for="field-fullName" exists', () => {
    const label = document.querySelector('label[for="field-fullName"]');
    expect(label).not.toBeNull();
  });

  test('label text is "Nombre completo"', () => {
    const label = document.querySelector('label[for="field-fullName"]');
    expect(label.textContent.trim()).toBe('Nombre completo');
  });
});

// ── Initialisation ────────────────────────────────────────────────────────────

describe('full name field – store initialisation', () => {
  test('field starts empty when DEFAULT_CV.personal.fullName is empty', () => {
    window.CVStudio.initPersonalFields();
    expect(document.getElementById('field-fullName').value).toBe('');
  });

  test('field reflects a pre-set fullName in the store', () => {
    window.CVStudio.CVStore.setState(function (s) {
      return Object.assign({}, s, {
        personal: Object.assign({}, s.personal, { fullName: 'Ada Lovelace' })
      });
    });
    window.CVStudio.initPersonalFields();
    expect(document.getElementById('field-fullName').value).toBe('Ada Lovelace');
  });
});

// ── Field → Store ─────────────────────────────────────────────────────────────

describe('full name field – field updates store', () => {
  beforeEach(() => { window.CVStudio.initPersonalFields(); });

  test('typing in the input updates CVStore.personal.fullName', () => {
    const input = document.getElementById('field-fullName');
    input.value = 'Grace Hopper';
    input.dispatchEvent(new Event('input'));
    expect(window.CVStudio.CVStore.getState().personal.fullName).toBe('Grace Hopper');
  });

  test('clearing the input sets fullName to empty string', () => {
    const input = document.getElementById('field-fullName');
    input.value = 'Someone';
    input.dispatchEvent(new Event('input'));
    input.value = '';
    input.dispatchEvent(new Event('input'));
    expect(window.CVStudio.CVStore.getState().personal.fullName).toBe('');
  });
});

// ── Store → Field ─────────────────────────────────────────────────────────────

describe('full name field – store updates field', () => {
  beforeEach(() => { window.CVStudio.initPersonalFields(); });

  test('store change propagates to input value', () => {
    window.CVStudio.CVStore.setState(function (s) {
      return Object.assign({}, s, {
        personal: Object.assign({}, s.personal, { fullName: 'Linus Torvalds' })
      });
    });
    expect(document.getElementById('field-fullName').value).toBe('Linus Torvalds');
  });

  test('store reset clears the input', () => {
    const input = document.getElementById('field-fullName');
    input.value = 'Someone';
    input.dispatchEvent(new Event('input'));
    window.CVStudio.CVStore.setState(function (s) {
      return Object.assign({}, s, {
        personal: Object.assign({}, s.personal, { fullName: '' })
      });
    });
    expect(input.value).toBe('');
  });
});
