const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('Import Data feature', (t) => {
    const htmlPath = path.join(__dirname, 'index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    t.test('should have an Import Data button', () => {
        assert.ok(htmlContent.includes('id="import-data"'), 'Missing import-data button id');
        assert.ok(htmlContent.includes('Importar Datos'), 'Missing Importar Datos button text');
    });

    t.test('should have a hidden file input for import', () => {
        assert.ok(htmlContent.includes('type="file"'), 'Missing file input type');
        assert.ok(htmlContent.includes('id="import-input"'), 'Missing import-input id');
        assert.ok(htmlContent.includes('style="display: none;"'), 'File input should be hidden');
        assert.ok(htmlContent.includes('accept=".json"'), 'File input should accept .json files');
    });

    t.test('should have importData function in CVStudio', () => {
        assert.ok(htmlContent.includes('importData: function'), 'Missing importData function in CVStudio');
    });

    t.test('should have validateData function in CVStudio', () => {
        assert.ok(htmlContent.includes('validateData: function'), 'Missing validateData function in CVStudio');
    });

    t.test('should use validateData in importData', () => {
        assert.ok(htmlContent.includes('self.validateData(importedData)'), 'Missing validateData call in importData');
    });

    t.test('should use FileReader for importing data', () => {
        assert.ok(htmlContent.includes('new FileReader'), 'Missing FileReader usage in importData');
    });

    t.test('should use readAsText in importData', () => {
        assert.ok(htmlContent.includes('readAsText'), 'Missing readAsText in importData');
    });

    t.test('should bind import button click event', () => {
        assert.ok(htmlContent.includes("this.importBtn.addEventListener('click'"), 'Missing import button click event binding');
    });
});
