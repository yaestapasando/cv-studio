const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('Skills Section', (t) => {
    const htmlPath = path.join(__dirname, 'index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    t.test('should have a skills input with correct data-path and label', () => {
        // We'll use a text input for comma-separated skills for now, as specified in the task (simple text input)
        assert.ok(htmlContent.includes('data-path="skills"'), 'Missing data-path="skills"');
        assert.ok(htmlContent.includes('<input type="text" id="skills"'), 'Missing input with id="skills"');
        assert.ok(htmlContent.includes('<label for="skills">Habilidades</label>'), 'Missing label for skills');
    });

    t.test('should have a section title for the skills in the editor', () => {
        assert.ok(htmlContent.includes('<h2>Habilidades</h2>'), 'Missing section title in editor');
    });

    t.test('should render the skills in the preview with a title', () => {
        assert.ok(htmlContent.includes('class="cv-skills"'), 'Missing cv-skills class in preview');
        assert.ok(htmlContent.includes('<h2 class="cv-section-title">Habilidades</h2>'), 'Missing section title in preview');
    });
});
