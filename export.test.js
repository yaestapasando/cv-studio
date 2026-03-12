const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('Export Data feature', (t) => {
    const htmlPath = path.join(__dirname, 'index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    t.test('should have an Export Data button', () => {
        assert.ok(htmlContent.includes('id="export-data"'), 'Missing export-data button id');
        assert.ok(htmlContent.includes('Exportar Datos'), 'Missing Exportar Datos button text');
    });

    t.test('should have exportData function in CVStudio', () => {
        assert.ok(htmlContent.includes('exportData: function'), 'Missing exportData function in CVStudio');
    });

    t.test('should use Blob and URL.createObjectURL for export', () => {
        assert.ok(htmlContent.includes('new Blob'), 'Missing Blob usage in exportData');
        assert.ok(htmlContent.includes('URL.createObjectURL'), 'Missing URL.createObjectURL usage in exportData');
    });

    t.test('should have a download attribute for the export link', () => {
        assert.ok(htmlContent.includes('download'), 'Missing download attribute for export');
    });

    t.test('should bind export button click event', () => {
        assert.ok(htmlContent.includes('this.exportBtn.addEventListener(\'click\''), 'Missing export button click event binding');
    });

    t.test('should revoke the object URL after download', () => {
        assert.ok(htmlContent.includes('URL.revokeObjectURL'), 'Missing URL.revokeObjectURL usage in exportData');
    });
});
