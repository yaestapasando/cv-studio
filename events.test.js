const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('Form Events Connection', (t) => {
    const htmlPath = path.join(__dirname, 'index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    t.test('should have an event listener for "input" on the editor', () => {
        assert.ok(htmlContent.includes("this.editor.addEventListener('input'"), 'Missing "input" event listener');
    });

    t.test('should have an event listener for "change" on the editor', () => {
        // This is what we are about to add
        assert.ok(htmlContent.includes("'change'") || htmlContent.includes('"change"'), 'Missing "change" event listener');
    });

    t.test('event handler should handle both input and change for all data-path elements', () => {
        // We want to ensure that whichever event fires, it updates the state
        // We'll check for the logic that extracts value and updates state
        assert.ok(htmlContent.includes("e.target.getAttribute('data-path')"), 'Missing data-path attribute check');
        assert.ok(htmlContent.includes("self.updateStateByPath(path, value)"), 'Missing state update call');
    });
});
