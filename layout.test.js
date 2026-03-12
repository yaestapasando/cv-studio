const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('A4 Paper Layout', (t) => {
    const htmlPath = path.join(__dirname, 'index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    t.test('should have A4 dimensions defined in CSS variables', () => {
        assert.ok(htmlContent.includes('--a4-width: 210mm;'), 'Missing --a4-width: 210mm');
        assert.ok(htmlContent.includes('--a4-height: 297mm;'), 'Missing --a4-height: 297mm');
    });

    t.test('should have cv-paper styled as a white sheet with shadow', () => {
        // Check for the selector
        assert.ok(htmlContent.includes('#cv-paper'), 'Missing #cv-paper selector');
        
        // Check for background white
        assert.ok(htmlContent.includes('background: var(--white);') || htmlContent.includes('background-color: var(--white);'), 'Missing white background for cv-paper');
        
        // Check for shadow
        assert.ok(htmlContent.includes('box-shadow: 0 0 20px rgb(0 0 0 / 10%);') || htmlContent.includes('box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);'), 'Missing box-shadow for cv-paper');
        
        // Check for A4 dimensions
        assert.ok(htmlContent.includes('max-width: var(--a4-width);'), 'Missing max-width: var(--a4-width)');
        assert.ok(htmlContent.includes('min-height: var(--a4-height);'), 'Missing min-height: var(--a4-height)');
        
        // Check for A4 standard padding
        assert.ok(htmlContent.includes('padding: 20mm;'), 'Missing standard A4 padding: 20mm');
    });
});
