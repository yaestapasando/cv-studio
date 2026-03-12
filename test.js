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

test('CV state structure', (t) => {
    const htmlPath = path.join(__dirname, 'index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    t.test('should have a state object with personalData', () => {
        assert.ok(htmlContent.includes('personalData: {'), 'Missing personalData in state');
        assert.ok(htmlContent.includes('firstName:'), 'Missing firstName in personalData');
        assert.ok(htmlContent.includes('lastName:'), 'Missing lastName in personalData');
        assert.ok(htmlContent.includes('email:'), 'Missing email in personalData');
        assert.ok(htmlContent.includes('phone:'), 'Missing phone in personalData');
        assert.ok(htmlContent.includes('website:'), 'Missing website in personalData');
        assert.ok(htmlContent.includes('location:'), 'Missing location in personalData');
        assert.ok(htmlContent.includes('title:'), 'Missing title in personalData');
        assert.ok(htmlContent.includes('linkedin:'), 'Missing linkedin in personalData');
        assert.ok(htmlContent.includes('github:'), 'Missing github in personalData');
    });

    t.test('should have a summary field', () => {
        assert.ok(htmlContent.includes('summary:'), 'Missing summary in state');
    });

    t.test('should have an experience array with structure comment', () => {
        assert.ok(htmlContent.includes('experience: []'), 'Missing experience in state');
        assert.ok(htmlContent.includes('company: string'), 'Missing company in experience schema');
        assert.ok(htmlContent.includes('position: string'), 'Missing position in experience schema');
        assert.ok(htmlContent.includes('startDate: string'), 'Missing startDate in experience schema');
        assert.ok(htmlContent.includes('endDate: string'), 'Missing endDate in experience schema');
    });

    t.test('should have an education array with structure comment', () => {
        assert.ok(htmlContent.includes('education: []'), 'Missing education in state');
        assert.ok(htmlContent.includes('institution: string'), 'Missing institution in education schema');
        assert.ok(htmlContent.includes('degree: string'), 'Missing degree in education schema');
    });

    t.test('should have a skills array with structure comment', () => {
        assert.ok(htmlContent.includes('skills: []'), 'Missing skills in state');
    });
});

test('Reactive state and render mechanism', (t) => {
    const htmlPath = path.join(__dirname, 'index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    t.test('should have a createReactiveState function', () => {
        assert.ok(htmlContent.includes('createReactiveState: function'), 'Missing createReactiveState function');
    });

    t.test('should use a Proxy for reactivity', () => {
        assert.ok(htmlContent.includes('new Proxy'), 'Missing Proxy usage');
    });

    t.test('should have a render function', () => {
        assert.ok(htmlContent.includes('render: function'), 'Missing render function');
    });

    t.test('should call render on state change', () => {
        assert.ok(htmlContent.includes('self.render()'), 'Missing render call on state change');
    });

    t.test('should update preview innerHTML in render', () => {
        assert.ok(htmlContent.includes('this.preview.innerHTML ='), 'Missing innerHTML update in render');
    });
});
