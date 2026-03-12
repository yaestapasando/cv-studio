const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('Accessibility - Focus States', (t) => {
    const htmlPath = path.join(__dirname, 'index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    t.test('should have an improved focus ring for inputs and textareas', () => {
        assert.ok(htmlContent.includes('box-shadow: 0 0 0 3px rgb(37 99 235 / 20%)'), 'Missing focus box-shadow');
        assert.ok(htmlContent.includes('outline: 2px solid transparent'), 'Missing outline reset for focus');
    });

    t.test('should have focus-visible styles for buttons', () => {
        assert.ok(htmlContent.includes('.btn:focus-visible'), 'Missing .btn:focus-visible styles');
        assert.ok(htmlContent.includes('outline: 2px solid var(--primary)'), 'Missing focus-visible outline');
    });
});

test('Accessibility - Labels and IDs in Dynamic Content', (t) => {
    const htmlPath = path.join(__dirname, 'index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    t.test('should have for/id mapping in experience editor', () => {
        assert.ok(htmlContent.includes('label for="exp-company-${exp.id}"'), 'Missing label for in experience company');
        assert.ok(htmlContent.includes('input type="text" id="exp-company-${exp.id}"'), 'Missing input id in experience company');
        
        assert.ok(htmlContent.includes('label for="exp-desc-${exp.id}"'), 'Missing label for in experience description');
        assert.ok(htmlContent.includes('textarea id="exp-desc-${exp.id}"'), 'Missing textarea id in experience description');
    });

    t.test('should have for/id mapping in education editor', () => {
        assert.ok(htmlContent.includes('label for="edu-institution-${edu.id}"'), 'Missing label for in education institution');
        assert.ok(htmlContent.includes('input type="text" id="edu-institution-${edu.id}"'), 'Missing input id in education institution');
        
        assert.ok(htmlContent.includes('label for="edu-desc-${edu.id}"'), 'Missing label for in education description');
        assert.ok(htmlContent.includes('textarea id="edu-desc-${edu.id}"'), 'Missing textarea id in education description');
    });
});

test('Accessibility - Aria Labels', (t) => {
    const htmlPath = path.join(__dirname, 'index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    t.test('should have aria-labels for experience control buttons', () => {
        assert.ok(htmlContent.includes('aria-label="Subir experiencia"'), 'Missing aria-label for move-up experience');
        assert.ok(htmlContent.includes('aria-label="Bajar experiencia"'), 'Missing aria-label for move-down experience');
        assert.ok(htmlContent.includes('aria-label="Eliminar experiencia"'), 'Missing aria-label for remove experience');
    });

    t.test('should have aria-labels for education control buttons', () => {
        assert.ok(htmlContent.includes('aria-label="Subir educación"'), 'Missing aria-label for move-up education');
        assert.ok(htmlContent.includes('aria-label="Bajar educación"'), 'Missing aria-label for move-down education');
        assert.ok(htmlContent.includes('aria-label="Eliminar educación"'), 'Missing aria-label for remove education');
    });
});
