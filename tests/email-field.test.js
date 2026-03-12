/**
 * Tests for F-02: Personal section — email field with format validation
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

describe('email field – DOM structure', () => {
  test('#field-email input exists inside #form-personal', () => {
    const form = document.getElementById('form-personal');
    expect(form.querySelector('#field-email')).not.toBeNull();
  });

  test('#field-email is type="email"', () => {
    expect(document.getElementById('field-email').type).toBe('email');
  });

  test('#field-email has name="email"', () => {
    expect(document.getElementById('field-email').name).toBe('email');
  });

  test('#field-email has autocomplete="email"', () => {
    expect(document.getElementById('field-email').getAttribute('autocomplete')).toBe('email');
  });

  test('#field-email has maxlength="254"', () => {
    expect(document.getElementById('field-email').getAttribute('maxlength')).toBe('254');
  });

  test('label for="field-email" exists', () => {
    expect(document.querySelector('label[for="field-email"]')).not.toBeNull();
  });

  test('label text is "Correo electrónico"', () => {
    const label = document.querySelector('label[for="field-email"]');
    expect(label.textContent.trim()).toBe('Correo electrónico');
  });

  test('#field-email-error span exists', () => {
    expect(document.getElementById('field-email-error')).not.toBeNull();
  });

  test('#field-email-error starts hidden', () => {
    expect(document.getElementById('field-email-error').hidden).toBe(true);
  });
});

// ── isValidEmail ──────────────────────────────────────────────────────────────

describe('isValidEmail – valid addresses', () => {
  test('empty string returns true', () => {
    expect(window.CVStudio.isValidEmail('')).toBe(true);
  });

  test('simple address is valid', () => {
    expect(window.CVStudio.isValidEmail('user@example.com')).toBe(true);
  });

  test('address with subdomain is valid', () => {
    expect(window.CVStudio.isValidEmail('user@mail.example.com')).toBe(true);
  });

  test('address with plus tag is valid', () => {
    expect(window.CVStudio.isValidEmail('user+tag@example.com')).toBe(true);
  });

  test('address with dots in local part is valid', () => {
    expect(window.CVStudio.isValidEmail('first.last@example.com')).toBe(true);
  });
});

describe('isValidEmail – invalid addresses', () => {
  test('missing @ returns false', () => {
    expect(window.CVStudio.isValidEmail('userexample.com')).toBe(false);
  });

  test('missing domain returns false', () => {
    expect(window.CVStudio.isValidEmail('user@')).toBe(false);
  });

  test('missing TLD returns false', () => {
    expect(window.CVStudio.isValidEmail('user@example')).toBe(false);
  });

  test('spaces in address return false', () => {
    expect(window.CVStudio.isValidEmail('user @example.com')).toBe(false);
  });

  test('double @ returns false', () => {
    expect(window.CVStudio.isValidEmail('user@@example.com')).toBe(false);
  });
});

// ── Store initialisation ──────────────────────────────────────────────────────

describe('email field – store initialisation', () => {
  test('field starts empty when DEFAULT_CV.personal.email is empty', () => {
    window.CVStudio.initPersonalFields();
    expect(document.getElementById('field-email').value).toBe('');
  });

  test('field reflects a pre-set email in the store', () => {
    window.CVStudio.CVStore.setState(function (s) {
      return Object.assign({}, s, {
        personal: Object.assign({}, s.personal, { email: 'ada@example.com' })
      });
    });
    window.CVStudio.initPersonalFields();
    expect(document.getElementById('field-email').value).toBe('ada@example.com');
  });
});

// ── Field → Store ─────────────────────────────────────────────────────────────

describe('email field – field updates store', () => {
  beforeEach(() => { window.CVStudio.initPersonalFields(); });

  test('typing a valid email updates CVStore.personal.email', () => {
    const input = document.getElementById('field-email');
    input.value = 'user@example.com';
    input.dispatchEvent(new Event('input'));
    expect(window.CVStudio.CVStore.getState().personal.email).toBe('user@example.com');
  });

  test('typing an invalid email still updates the store value', () => {
    const input = document.getElementById('field-email');
    input.value = 'not-an-email';
    input.dispatchEvent(new Event('input'));
    expect(window.CVStudio.CVStore.getState().personal.email).toBe('not-an-email');
  });

  test('clearing the input sets email to empty string', () => {
    const input = document.getElementById('field-email');
    input.value = 'user@example.com';
    input.dispatchEvent(new Event('input'));
    input.value = '';
    input.dispatchEvent(new Event('input'));
    expect(window.CVStudio.CVStore.getState().personal.email).toBe('');
  });

  test('email change does not affect fullName in store', () => {
    window.CVStudio.CVStore.setState(function (s) {
      return Object.assign({}, s, { personal: Object.assign({}, s.personal, { fullName: 'Ada Lovelace' }) });
    });
    const input = document.getElementById('field-email');
    input.value = 'ada@example.com';
    input.dispatchEvent(new Event('input'));
    expect(window.CVStudio.CVStore.getState().personal.fullName).toBe('Ada Lovelace');
  });
});

// ── Store → Field ─────────────────────────────────────────────────────────────

describe('email field – store updates field', () => {
  beforeEach(() => { window.CVStudio.initPersonalFields(); });

  test('store change propagates to input value', () => {
    window.CVStudio.CVStore.setState(function (s) {
      return Object.assign({}, s, {
        personal: Object.assign({}, s.personal, { email: 'linus@example.com' })
      });
    });
    expect(document.getElementById('field-email').value).toBe('linus@example.com');
  });

  test('store reset clears the input', () => {
    const input = document.getElementById('field-email');
    input.value = 'user@example.com';
    input.dispatchEvent(new Event('input'));
    window.CVStudio.CVStore.setState(function (s) {
      return Object.assign({}, s, {
        personal: Object.assign({}, s.personal, { email: '' })
      });
    });
    expect(input.value).toBe('');
  });
});

// ── Validation feedback ───────────────────────────────────────────────────────

describe('email field – validation feedback', () => {
  beforeEach(() => { window.CVStudio.initPersonalFields(); });

  test('valid email: no error class, error hidden', () => {
    const input = document.getElementById('field-email');
    const error = document.getElementById('field-email-error');
    input.value = 'user@example.com';
    input.dispatchEvent(new Event('input'));
    expect(input.classList.contains('field-invalid')).toBe(false);
    expect(error.hidden).toBe(true);
  });

  test('invalid email: adds field-invalid class', () => {
    const input = document.getElementById('field-email');
    input.value = 'bad-email';
    input.dispatchEvent(new Event('input'));
    expect(input.classList.contains('field-invalid')).toBe(true);
  });

  test('invalid email: shows error message', () => {
    const input = document.getElementById('field-email');
    const error = document.getElementById('field-email-error');
    input.value = 'bad-email';
    input.dispatchEvent(new Event('input'));
    expect(error.hidden).toBe(false);
    expect(error.textContent).toBeTruthy();
  });

  test('correcting invalid email removes error', () => {
    const input = document.getElementById('field-email');
    const error = document.getElementById('field-email-error');
    input.value = 'bad-email';
    input.dispatchEvent(new Event('input'));
    input.value = 'good@example.com';
    input.dispatchEvent(new Event('input'));
    expect(input.classList.contains('field-invalid')).toBe(false);
    expect(error.hidden).toBe(true);
  });

  test('clearing the field removes error (empty is valid)', () => {
    const input = document.getElementById('field-email');
    const error = document.getElementById('field-email-error');
    input.value = 'bad-email';
    input.dispatchEvent(new Event('input'));
    input.value = '';
    input.dispatchEvent(new Event('input'));
    expect(input.classList.contains('field-invalid')).toBe(false);
    expect(error.hidden).toBe(true);
  });
});
