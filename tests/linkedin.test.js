/**
 * Tests for F-02: LinkedIn URL field
 * Verifies HTML structure, URL validation, and bidirectional store binding.
 */

const fs   = require('fs');
const path = require('path');

const html          = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const scriptContent = html.match(/<script>([\s\S]*?)<\/script>/)[1];

const setHTML = () => {
  document.documentElement.innerHTML = html
    .replace(/^[\s\S]*<html[^>]*>/, '')
    .replace(/<\/html>[\s\S]*$/, '');
};

// ── HTML structure ────────────────────────────────────────────────────────────

describe('LinkedIn URL field — HTML structure', () => {
  beforeEach(setHTML);

  test('has #field-linkedIn input', () => {
    expect(document.getElementById('field-linkedIn')).not.toBeNull();
  });

  test('#field-linkedIn has type="url"', () => {
    const input = document.getElementById('field-linkedIn');
    expect(input.getAttribute('type')).toBe('url');
  });

  test('#field-linkedIn has name="linkedIn"', () => {
    const input = document.getElementById('field-linkedIn');
    expect(input.getAttribute('name')).toBe('linkedIn');
  });

  test('has a <label> pointing to #field-linkedIn', () => {
    expect(document.querySelector('label[for="field-linkedIn"]')).not.toBeNull();
  });

  test('has error span #field-linkedIn-error', () => {
    expect(document.getElementById('field-linkedIn-error')).not.toBeNull();
  });

  test('#field-linkedIn-error has aria-live="polite"', () => {
    const error = document.getElementById('field-linkedIn-error');
    expect(error.getAttribute('aria-live')).toBe('polite');
  });

  test('#field-linkedIn-error is hidden by default', () => {
    const error = document.getElementById('field-linkedIn-error');
    expect(error.hidden).toBe(true);
  });

  test('#field-linkedIn is inside #section-personal', () => {
    const section = document.getElementById('section-personal');
    const input   = document.getElementById('field-linkedIn');
    expect(section.contains(input)).toBe(true);
  });

  test('#field-linkedIn is inside #form-personal', () => {
    const form  = document.getElementById('form-personal');
    const input = document.getElementById('field-linkedIn');
    expect(form.contains(input)).toBe(true);
  });
});

// ── isValidLinkedIn ───────────────────────────────────────────────────────────

describe('isValidLinkedIn', () => {
  let isValidLinkedIn;

  beforeEach(() => {
    setHTML();
    eval(scriptContent); // populates window.CVStudio
    isValidLinkedIn = window.CVStudio.isValidLinkedIn;
  });

  test('empty string is valid (field is optional)', () => {
    expect(isValidLinkedIn('')).toBe(true);
  });

  test('https://www.linkedin.com/in/user is valid', () => {
    expect(isValidLinkedIn('https://www.linkedin.com/in/johndoe')).toBe(true);
  });

  test('https://linkedin.com/in/user (no www) is valid', () => {
    expect(isValidLinkedIn('https://linkedin.com/in/johndoe')).toBe(true);
  });

  test('http:// linkedin URL is valid', () => {
    expect(isValidLinkedIn('http://www.linkedin.com/in/johndoe')).toBe(true);
  });

  test('non-linkedin URL is invalid', () => {
    expect(isValidLinkedIn('https://example.com/profile')).toBe(false);
  });

  test('plain text without scheme is invalid', () => {
    expect(isValidLinkedIn('johndoe')).toBe(false);
  });

  test('linkedin.com without path is invalid', () => {
    expect(isValidLinkedIn('https://www.linkedin.com')).toBe(false);
  });
});

// ── Store binding ─────────────────────────────────────────────────────────────

describe('LinkedIn field — store binding', () => {
  beforeEach(() => {
    setHTML();
    eval(scriptContent);
    window.CVStudio.initPersonalFields();
  });

  test('typing a valid LinkedIn URL updates the store', () => {
    const input = document.getElementById('field-linkedIn');
    input.value = 'https://www.linkedin.com/in/johndoe';
    input.dispatchEvent(new Event('input'));
    const state = window.CVStudio.CVStore.getState();
    expect(state.personal.linkedIn).toBe('https://www.linkedin.com/in/johndoe');
  });

  test('typing an invalid URL marks the field as invalid and shows error', () => {
    const input = document.getElementById('field-linkedIn');
    const error = document.getElementById('field-linkedIn-error');
    input.value = 'not-a-linkedin-url';
    input.dispatchEvent(new Event('input'));
    expect(input.classList.contains('field-invalid')).toBe(true);
    expect(error.hidden).toBe(false);
    expect(error.textContent).toBeTruthy();
  });

  test('clearing after invalid input removes error', () => {
    const input = document.getElementById('field-linkedIn');
    const error = document.getElementById('field-linkedIn-error');
    input.value = 'bad-url';
    input.dispatchEvent(new Event('input'));
    input.value = '';
    input.dispatchEvent(new Event('input'));
    expect(input.classList.contains('field-invalid')).toBe(false);
    expect(error.hidden).toBe(true);
  });

  test('store → field: state change syncs to input', () => {
    window.CVStudio.CVStore.setState(function (s) {
      return Object.assign({}, s, { personal: Object.assign({}, s.personal, { linkedIn: 'https://linkedin.com/in/test' }) });
    });
    const input = document.getElementById('field-linkedIn');
    expect(input.value).toBe('https://linkedin.com/in/test');
  });
});
