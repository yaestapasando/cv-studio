/**
 * Tests for F-02: Portfolio / web personal URL field
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

describe('Website URL field — HTML structure', () => {
  beforeEach(setHTML);

  test('has #field-website input', () => {
    expect(document.getElementById('field-website')).not.toBeNull();
  });

  test('#field-website has type="url"', () => {
    const input = document.getElementById('field-website');
    expect(input.getAttribute('type')).toBe('url');
  });

  test('#field-website has name="website"', () => {
    const input = document.getElementById('field-website');
    expect(input.getAttribute('name')).toBe('website');
  });

  test('has a <label> pointing to #field-website', () => {
    expect(document.querySelector('label[for="field-website"]')).not.toBeNull();
  });

  test('has error span #field-website-error', () => {
    expect(document.getElementById('field-website-error')).not.toBeNull();
  });

  test('#field-website-error has aria-live="polite"', () => {
    const error = document.getElementById('field-website-error');
    expect(error.getAttribute('aria-live')).toBe('polite');
  });

  test('#field-website-error is hidden by default', () => {
    const error = document.getElementById('field-website-error');
    expect(error.hidden).toBe(true);
  });

  test('#field-website is inside #section-personal', () => {
    const section = document.getElementById('section-personal');
    const input   = document.getElementById('field-website');
    expect(section.contains(input)).toBe(true);
  });

  test('#field-website is inside #form-personal', () => {
    const form  = document.getElementById('form-personal');
    const input = document.getElementById('field-website');
    expect(form.contains(input)).toBe(true);
  });
});

// ── isValidWebsite ────────────────────────────────────────────────────────────

describe('isValidWebsite', () => {
  let isValidWebsite;

  beforeEach(() => {
    setHTML();
    eval(scriptContent); // populates window.CVStudio
    isValidWebsite = window.CVStudio.isValidWebsite;
  });

  test('empty string is valid (field is optional)', () => {
    expect(isValidWebsite('')).toBe(true);
  });

  test('https://mipagina.com is valid', () => {
    expect(isValidWebsite('https://mipagina.com')).toBe(true);
  });

  test('http://example.com is valid', () => {
    expect(isValidWebsite('http://example.com')).toBe(true);
  });

  test('https://sub.domain.io/path is valid', () => {
    expect(isValidWebsite('https://sub.domain.io/path')).toBe(true);
  });

  test('plain text without scheme is invalid', () => {
    expect(isValidWebsite('mipagina.com')).toBe(false);
  });

  test('ftp:// scheme is invalid', () => {
    expect(isValidWebsite('ftp://example.com')).toBe(false);
  });

  test('just https:// with no domain is invalid', () => {
    expect(isValidWebsite('https://')).toBe(false);
  });
});

// ── Store binding ─────────────────────────────────────────────────────────────

describe('Website field — store binding', () => {
  beforeEach(() => {
    setHTML();
    eval(scriptContent);
    window.CVStudio.initPersonalFields();
  });

  test('typing a valid URL updates the store', () => {
    const input = document.getElementById('field-website');
    input.value = 'https://mipagina.com';
    input.dispatchEvent(new Event('input'));
    const state = window.CVStudio.CVStore.getState();
    expect(state.personal.website).toBe('https://mipagina.com');
  });

  test('typing an invalid URL marks the field as invalid and shows error', () => {
    const input = document.getElementById('field-website');
    const error = document.getElementById('field-website-error');
    input.value = 'not-a-url';
    input.dispatchEvent(new Event('input'));
    expect(input.classList.contains('field-invalid')).toBe(true);
    expect(error.hidden).toBe(false);
    expect(error.textContent).toBeTruthy();
  });

  test('clearing after invalid input removes error', () => {
    const input = document.getElementById('field-website');
    const error = document.getElementById('field-website-error');
    input.value = 'bad-url';
    input.dispatchEvent(new Event('input'));
    input.value = '';
    input.dispatchEvent(new Event('input'));
    expect(input.classList.contains('field-invalid')).toBe(false);
    expect(error.hidden).toBe(true);
  });

  test('store → field: state change syncs to input', () => {
    window.CVStudio.CVStore.setState(function (s) {
      return Object.assign({}, s, { personal: Object.assign({}, s.personal, { website: 'https://portfolio.dev' }) });
    });
    const input = document.getElementById('field-website');
    expect(input.value).toBe('https://portfolio.dev');
  });
});
