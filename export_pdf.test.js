const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('Export to PDF feature', (t) => {
    const htmlPath = path.join(__dirname, 'index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    t.test('should have an Export to PDF button', () => {
        assert.ok(htmlContent.includes('id="export-pdf"'), 'Missing export-pdf button id');
        assert.ok(htmlContent.includes('Exportar a PDF'), 'Missing Exportar a PDF button text');
    });

    t.test('should have exportPDF function in CVStudio', () => {
        assert.ok(htmlContent.includes('exportPDF: function'), 'Missing exportPDF function in CVStudio');
    });

    t.test('should trigger window.print() in exportPDF function', () => {
        assert.ok(htmlContent.includes('window.print()'), 'Missing window.print() call in exportPDF');
    });

    t.test('should bind export-pdf button click event', () => {
        assert.ok(htmlContent.includes("this.exportPdfBtn.addEventListener('click'"), 'Missing export-pdf button click event binding');
    });
});
