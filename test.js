const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('index.html structure', (t) => {
    const htmlPath = path.join(__dirname, 'index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    t.test('should have a DOCTYPE', () => {
        assert.ok(htmlContent.includes('<!DOCTYPE html>'), 'Missing DOCTYPE');
    });

    t.test('should have an html tag with lang="es"', () => {
        assert.ok(htmlContent.includes('<html lang="es">'), 'Missing lang="es"');
    });

    t.test('should have a <style> tag', () => {
        assert.ok(htmlContent.includes('<style>'), 'Missing <style> tag');
        assert.ok(htmlContent.includes('</style>'), 'Missing </style> tag');
    });

    t.test('should have a <script> tag', () => {
        assert.ok(htmlContent.includes('<script>'), 'Missing <script> tag');
        assert.ok(htmlContent.includes('</script>'), 'Missing </script> tag');
    });

    t.test('should have an app container', () => {
        assert.ok(htmlContent.includes('id="app"'), 'Missing app container id="app"');
    });
});
