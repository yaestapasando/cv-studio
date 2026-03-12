const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('Summary Section', (t) => {
    const htmlPath = path.join(__dirname, 'index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    t.test('should have a summary textarea with correct data-path and label', () => {
        assert.ok(htmlContent.includes('data-path="summary"'), 'Missing data-path="summary"');
        assert.ok(htmlContent.includes('<textarea id="summary"'), 'Missing textarea with id="summary"');
        assert.ok(htmlContent.includes('<label for="summary">Descripción</label>'), 'Missing label for summary');
    });

    t.test('should have a section title for the summary in the editor', () => {
        assert.ok(htmlContent.includes('<h2>Extracto / Perfil Profesional</h2>'), 'Missing section title in editor');
    });

    t.test('should render the summary in the preview with a title', () => {
        assert.ok(htmlContent.includes('class="cv-summary"'), 'Missing cv-summary class in preview');
        assert.ok(htmlContent.includes('<h2 class="cv-section-title">Perfil Profesional</h2>'), 'Missing section title in preview');
        assert.ok(htmlContent.includes('${summary}'), 'Missing summary interpolation in render function');
    });
});
