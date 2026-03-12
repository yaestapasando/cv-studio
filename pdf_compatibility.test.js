const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('PDF Compatibility Styles', (t) => {
    const htmlPath = path.join(__dirname, 'index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    t.test('should have print-color-adjust for cross-browser color consistency', () => {
        assert.ok(htmlContent.includes('print-color-adjust: exact'), 'Missing print-color-adjust: exact');
        assert.ok(htmlContent.includes('-webkit-print-color-adjust: exact'), 'Missing -webkit-print-color-adjust: exact');
    });

    t.test('should ensure html, body and #app have correct print properties', () => {
        assert.ok(htmlContent.includes('html, body, #app {'), 'Should target html, body and #app in print');
        assert.ok(htmlContent.includes('height: auto !important'), 'Should set height: auto !important for printing');
        assert.ok(htmlContent.includes('overflow: visible !important'), 'Should set overflow: visible !important for printing');
    });

    t.test('should maintain consistent padding for A4 paper in print', () => {
        // Look for the print section's #cv-paper
        const printPart = htmlContent.split('@media print')[1];
        assert.ok(printPart.includes('#cv-paper'), 'Missing #cv-paper in print styles');
        assert.ok(printPart.includes('padding: 20mm'), 'Should use 20mm padding for #cv-paper in print for consistency');
    });
    
    t.test('should maintain consistent grid gap in print', () => {
        const printPart = htmlContent.split('@media print')[1];
        assert.ok(printPart.includes('.cv-grid'), 'Missing .cv-grid in print styles');
        assert.ok(printPart.includes('gap: 2rem'), 'Should use 2rem gap for .cv-grid in print for consistency');
    });
});
