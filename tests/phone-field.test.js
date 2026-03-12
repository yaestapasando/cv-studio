/**
 * Tests for F-02: Personal section — phone field with format validation
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

describe('phone field – DOM structure', () => {
  test('#field-phone input exists inside #form-personal', () => {
    const form = document.getElementById('form-personal');
    expect(form.querySelector('#field-phone')).not.toBeNull();
  });

  test('#field-phone is type="tel"', () => {
    expect(document.getElementById('field-phone').type).toBe('tel');
  });

  test('#field-phone has name="phone"', () => {
    expect(document.getElementById('field-phone').name).toBe('phone');
  });

  test('#field-phone has autocomplete="tel"', () => {
    expect(document.getElementById('field-phone').getAttribute('autocomplete')).toBe('tel');
  });

  test('#field-phone has maxlength="30"', () => {
    expect(document.getElementById('field-phone').getAttribute('maxlength')).toBe('30');
  });

  test('label for="field-phone" exists', () => {
    expect(document.querySelector('label[for="field-phone"]')).not.toBeNull();
  });

  test('label text is "Teléfono"', () => {
    const label = document.querySelector('label[for="field-phone"]');
    expect(label.textContent.trim()).toBe('Teléfono');
  });

  test('#field-phone-error span exists', () => {
    expect(document.getElementById('field-phone-error')).not.toBeNull();
  });

  test('#field-phone-error starts hidden', () => {
    expect(document.getElementById('field-phone-error').hidden).toBe(true);
  });
});

// ── isValidPhone ──────────────────────────────────────────────────────────────

describe('isValidPhone – valid numbers', () => {
  test('empty string returns true', () => {
    expect(window.CVStudio.isValidPhone('')).toBe(true);
  });

  test('international format with + is valid', () => {
    expect(window.CVStudio.isValidPhone('+34 612 345 678')).toBe(true);
  });

  test('digits only is valid', () => {
    expect(window.CVStudio.isValidPhone('0034612345678')).toBe(true);
  });

  test('number with hyphens is valid', () => {
    expect(window.CVStudio.isValidPhone('612-345-678')).toBe(true);
  });

  test('number with parentheses is valid', () => {
    expect(window.CVStudio.isValidPhone('(+34) 612 345 678')).toBe(true);
  });

  test('number with dots is valid', () => {
    expect(window.CVStudio.isValidPhone('+1.800.555.1234')).toBe(true);
  });
});

describe('isValidPhone – invalid numbers', () => {
  test('too short (fewer than 7 chars) returns false', () => {
    expect(window.CVStudio.isValidPhone('123')).toBe(false);
  });

  test('letters in number return false', () => {
    expect(window.CVStudio.isValidPhone('abc-123-456')).toBe(false);
  });

  test('special characters return false', () => {
    expect(window.CVStudio.isValidPhone('+34@612345')).toBe(false);
  });
});

// ── Store initialisation ──────────────────────────────────────────────────────

describe('phone field – store initialisation', () => {
  test('field starts empty when DEFAULT_CV.personal.phone is empty', () => {
    window.CVStudio.initPersonalFields();
    expect(document.getElementById('field-phone').value).toBe('');
  });

  test('field reflects a pre-set phone in the store', () => {
    window.CVStudio.CVStore.setState(function (s) {
      return Object.assign({}, s, {
        personal: Object.assign({}, s.personal, { phone: '+34 612 345 678' })
      });
    });
    window.CVStudio.initPersonalFields();
    expect(document.getElementById('field-phone').value).toBe('+34 612 345 678');
  });
});

// ── Field → Store ─────────────────────────────────────────────────────────────

describe('phone field – field updates store', () => {
  beforeEach(() => { window.CVStudio.initPersonalFields(); });

  test('typing a valid phone updates CVStore.personal.phone', () => {
    const input = document.getElementById('field-phone');
    input.value = '+34 612 345 678';
    input.dispatchEvent(new Event('input'));
    expect(window.CVStudio.CVStore.getState().personal.phone).toBe('+34 612 345 678');
  });

  test('typing an invalid phone still updates the store value', () => {
    const input = document.getElementById('field-phone');
    input.value = 'bad';
    input.dispatchEvent(new Event('input'));
    expect(window.CVStudio.CVStore.getState().personal.phone).toBe('bad');
  });

  test('clearing the input sets phone to empty string', () => {
    const input = document.getElementById('field-phone');
    input.value = '+34 612 345 678';
    input.dispatchEvent(new Event('input'));
    input.value = '';
    input.dispatchEvent(new Event('input'));
    expect(window.CVStudio.CVStore.getState().personal.phone).toBe('');
  });

  test('phone change does not affect fullName in store', () => {
    window.CVStudio.CVStore.setState(function (s) {
      return Object.assign({}, s, { personal: Object.assign({}, s.personal, { fullName: 'Ada Lovelace' }) });
    });
    const input = document.getElementById('field-phone');
    input.value = '+34 600 000 000';
    input.dispatchEvent(new Event('input'));
    expect(window.CVStudio.CVStore.getState().personal.fullName).toBe('Ada Lovelace');
  });
});

// ── Store → Field ─────────────────────────────────────────────────────────────

describe('phone field – store updates field', () => {
  beforeEach(() => { window.CVStudio.initPersonalFields(); });

  test('store change propagates to input value', () => {
    window.CVStudio.CVStore.setState(function (s) {
      return Object.assign({}, s, {
        personal: Object.assign({}, s.personal, { phone: '+1 800 555 1234' })
      });
    });
    expect(document.getElementById('field-phone').value).toBe('+1 800 555 1234');
  });

  test('store reset clears the input', () => {
    const input = document.getElementById('field-phone');
    input.value = '+34 612 345 678';
    input.dispatchEvent(new Event('input'));
    window.CVStudio.CVStore.setState(function (s) {
      return Object.assign({}, s, {
        personal: Object.assign({}, s.personal, { phone: '' })
      });
    });
    expect(input.value).toBe('');
  });
});

// ── Validation feedback ───────────────────────────────────────────────────────

describe('phone field – validation feedback', () => {
  beforeEach(() => { window.CVStudio.initPersonalFields(); });

  test('valid phone: no error class, error hidden', () => {
    const input = document.getElementById('field-phone');
    const error = document.getElementById('field-phone-error');
    input.value = '+34 612 345 678';
    input.dispatchEvent(new Event('input'));
    expect(input.classList.contains('field-invalid')).toBe(false);
    expect(error.hidden).toBe(true);
  });

  test('invalid phone: adds field-invalid class', () => {
    const input = document.getElementById('field-phone');
    input.value = 'bad';
    input.dispatchEvent(new Event('input'));
    expect(input.classList.contains('field-invalid')).toBe(true);
  });

  test('invalid phone: shows error message', () => {
    const input = document.getElementById('field-phone');
    const error = document.getElementById('field-phone-error');
    input.value = 'bad';
    input.dispatchEvent(new Event('input'));
    expect(error.hidden).toBe(false);
    expect(error.textContent).toBeTruthy();
  });

  test('correcting invalid phone removes error', () => {
    const input = document.getElementById('field-phone');
    const error = document.getElementById('field-phone-error');
    input.value = 'bad';
    input.dispatchEvent(new Event('input'));
    input.value = '+34 612 345 678';
    input.dispatchEvent(new Event('input'));
    expect(input.classList.contains('field-invalid')).toBe(false);
    expect(error.hidden).toBe(true);
  });

  test('clearing the field removes error (empty is valid)', () => {
    const input = document.getElementById('field-phone');
    const error = document.getElementById('field-phone-error');
    input.value = 'bad';
    input.dispatchEvent(new Event('input'));
    input.value = '';
    input.dispatchEvent(new Event('input'));
    expect(input.classList.contains('field-invalid')).toBe(false);
    expect(error.hidden).toBe(true);
  });
});
