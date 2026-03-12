/**
 * Tests for F-02: Personal section — location field (ciudad, país)
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

describe('location field – DOM structure', () => {
  test('#field-location input exists inside #form-personal', () => {
    const form = document.getElementById('form-personal');
    expect(form.querySelector('#field-location')).not.toBeNull();
  });

  test('#field-location is type="text"', () => {
    expect(document.getElementById('field-location').type).toBe('text');
  });

  test('#field-location has name="location"', () => {
    expect(document.getElementById('field-location').name).toBe('location');
  });

  test('#field-location has autocomplete="address-level2"', () => {
    expect(document.getElementById('field-location').getAttribute('autocomplete')).toBe('address-level2');
  });

  test('#field-location has maxlength="120"', () => {
    expect(document.getElementById('field-location').getAttribute('maxlength')).toBe('120');
  });

  test('label for="field-location" exists', () => {
    expect(document.querySelector('label[for="field-location"]')).not.toBeNull();
  });

  test('label text is "Ubicación"', () => {
    const label = document.querySelector('label[for="field-location"]');
    expect(label.textContent.trim()).toBe('Ubicación');
  });
});

// ── Store initialisation ──────────────────────────────────────────────────────

describe('location field – store initialisation', () => {
  test('field starts empty when DEFAULT_CV.personal.location is empty', () => {
    window.CVStudio.initPersonalFields();
    expect(document.getElementById('field-location').value).toBe('');
  });

  test('field reflects a pre-set location in the store', () => {
    window.CVStudio.CVStore.setState(function (s) {
      return Object.assign({}, s, {
        personal: Object.assign({}, s.personal, { location: 'Madrid, España' })
      });
    });
    window.CVStudio.initPersonalFields();
    expect(document.getElementById('field-location').value).toBe('Madrid, España');
  });
});

// ── Field → Store ─────────────────────────────────────────────────────────────

describe('location field – field updates store', () => {
  beforeEach(() => { window.CVStudio.initPersonalFields(); });

  test('typing updates CVStore.personal.location', () => {
    const input = document.getElementById('field-location');
    input.value = 'Barcelona, España';
    input.dispatchEvent(new Event('input'));
    expect(window.CVStudio.CVStore.getState().personal.location).toBe('Barcelona, España');
  });

  test('clearing the input sets location to empty string', () => {
    const input = document.getElementById('field-location');
    input.value = 'Madrid, España';
    input.dispatchEvent(new Event('input'));
    input.value = '';
    input.dispatchEvent(new Event('input'));
    expect(window.CVStudio.CVStore.getState().personal.location).toBe('');
  });

  test('location change does not affect fullName in store', () => {
    window.CVStudio.CVStore.setState(function (s) {
      return Object.assign({}, s, { personal: Object.assign({}, s.personal, { fullName: 'Ada Lovelace' }) });
    });
    const input = document.getElementById('field-location');
    input.value = 'London, UK';
    input.dispatchEvent(new Event('input'));
    expect(window.CVStudio.CVStore.getState().personal.fullName).toBe('Ada Lovelace');
  });
});

// ── Store → Field ─────────────────────────────────────────────────────────────

describe('location field – store updates field', () => {
  beforeEach(() => { window.CVStudio.initPersonalFields(); });

  test('store change propagates to input value', () => {
    window.CVStudio.CVStore.setState(function (s) {
      return Object.assign({}, s, {
        personal: Object.assign({}, s.personal, { location: 'Buenos Aires, Argentina' })
      });
    });
    expect(document.getElementById('field-location').value).toBe('Buenos Aires, Argentina');
  });

  test('store reset clears the input', () => {
    const input = document.getElementById('field-location');
    input.value = 'Madrid, España';
    input.dispatchEvent(new Event('input'));
    window.CVStudio.CVStore.setState(function (s) {
      return Object.assign({}, s, {
        personal: Object.assign({}, s.personal, { location: '' })
      });
    });
    expect(input.value).toBe('');
  });
});
