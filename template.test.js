const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('Professional Template Structure', (t) => {
    const htmlPath = path.join(__dirname, 'index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    t.test('should have a two-column grid layout in the preview', () => {
        assert.ok(htmlContent.includes('class="cv-grid"'), 'Missing cv-grid class');
        assert.ok(htmlContent.includes('class="cv-main-col"'), 'Missing cv-main-col class');
        assert.ok(htmlContent.includes('class="cv-sidebar"'), 'Missing cv-sidebar class');
    });

    t.test('should have a styled header with name and title', () => {
        assert.ok(htmlContent.includes('class="cv-header"'), 'Missing cv-header class');
        assert.ok(htmlContent.includes('<h1>${personalData.firstName || \'Tu\'} <strong>${personalData.lastName || \'Nombre\'}</strong></h1>'), 'Missing structured h1 in header');
    });

    t.test('should have a contact list in the sidebar', () => {
        assert.ok(htmlContent.includes('class="cv-contact-list"'), 'Missing cv-contact-list class');
        assert.ok(htmlContent.includes('class="cv-contact-icon"'), 'Missing cv-contact-icon class');
        assert.ok(htmlContent.includes('class="cv-contact-value"'), 'Missing cv-contact-value class');
    });

    t.test('should have specific CSS for the two-column template', () => {
        assert.ok(htmlContent.includes('grid-template-columns: 2fr 1fr;'), 'Missing grid column definition');
        assert.ok(htmlContent.includes('border-bottom: 4px solid var(--primary);'), 'Missing header border-bottom');
        assert.ok(htmlContent.includes('.cv-section-title::after'), 'Missing section title decorative element');
    });

    t.test('should have professional typography settings', () => {
        assert.ok(htmlContent.includes('text-transform: uppercase;'), 'Missing uppercase transformations');
        assert.ok(htmlContent.includes('letter-spacing:'), 'Missing letter-spacing adjustments');
    });
});
