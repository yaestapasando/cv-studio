const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('Print Media Queries', (t) => {
    const htmlPath = path.join(__dirname, 'index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    t.test('should have consolidated @media print styles with page configuration', () => {
        assert.ok(htmlContent.includes('@page {'), 'Missing @page configuration');
        assert.ok(htmlContent.includes('size: a4;'), 'Missing size: a4 in @page');
        assert.ok(htmlContent.includes('margin: 0;'), 'Missing margin: 0 in @page');
    });

    t.test('should hide editor and non-essential elements for printing', () => {
        assert.ok(htmlContent.includes('.editor-panel {'), 'Missing .editor-panel style');
        assert.ok(htmlContent.includes('display: none !important;'), 'Missing display: none !important for editor-panel in print');
    });

    t.test('should avoid page breaks inside CV items', () => {
        assert.ok(htmlContent.includes('.cv-item {'), 'Missing .cv-item style');
        assert.ok(htmlContent.includes('break-inside: avoid;'), 'Missing break-inside: avoid for .cv-item in print');
    });

    t.test('should ensure CV paper occupies full width in print', () => {
        assert.ok(htmlContent.includes('#cv-paper {'), 'Missing #cv-paper style');
        assert.ok(htmlContent.includes('width: 100%;'), 'Missing width: 100% for #cv-paper in print');
    });
});
