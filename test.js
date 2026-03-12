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

    t.test('should have a title', () => {
        assert.ok(htmlContent.includes('<title>CV Studio - Generador de CV</title>'), 'Missing or incorrect title');
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

    t.test('should have an editor panel', () => {
        assert.ok(htmlContent.includes('class="editor-panel"'), 'Missing editor-panel class');
    });

    t.test('should have a preview panel', () => {
        assert.ok(htmlContent.includes('class="preview-panel"'), 'Missing preview-panel class');
    });

    t.test('should have a cv-paper element', () => {
        assert.ok(htmlContent.includes('id="cv-paper"'), 'Missing cv-paper id');
    });

    t.test('should have CSS variables defined', () => {
        const requiredVars = [
            '--primary',
            '--bg-editor',
            '--bg-preview',
            '--a4-width',
            '--a4-height'
        ];
        requiredVars.forEach(v => {
            assert.ok(htmlContent.includes(v), `Missing CSS variable: ${v}`);
        });
    });

    t.test('should have media queries for responsive design', () => {
        assert.ok(htmlContent.includes('@media'), 'Missing @media queries');
        assert.ok(htmlContent.includes('width <= 1024px'), 'Missing responsive media query (width <= 1024px)');
    });

    t.test('should have print media query', () => {
        assert.ok(htmlContent.includes('@media print'), 'Missing @media print query');
    });
});
