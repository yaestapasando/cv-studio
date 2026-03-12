const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('JSON Data Injection in Preview', (t) => {
    const htmlPath = path.join(__dirname, 'index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    t.test('should have a mechanism to inject JSON data with id "cv-data"', () => {
        // We look for the part of the code that injects the JSON data
        assert.ok(htmlContent.includes('cv-data'), 'Missing "cv-data" identifier');
        assert.ok(htmlContent.includes('application/json'), 'Missing "application/json" type');
        assert.ok(htmlContent.includes('JSON.stringify'), 'Missing JSON.stringify in render or injection logic');
    });

    t.test('should be part of the render function', () => {
        // We check if it's being added in the render function
        const renderFuncPart = htmlContent.substring(htmlContent.indexOf('render: function'));
        assert.ok(renderFuncPart.includes('cv-data'), 'Render function does not seem to include "cv-data"');
    });
});
