const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('Offline support and lack of external dependencies', (t) => {
    const htmlPath = path.join(__dirname, 'index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    t.test('should not contain external scripts (src with http/https)', () => {
        const scriptSrcMatch = htmlContent.match(/<script[^>]+src=['"](https?:)?\/\/[^'"]+['"]/gi);
        assert.strictEqual(scriptSrcMatch, null, `Found external script: ${scriptSrcMatch}`);
    });

    t.test('should not contain external stylesheets (href with http/https)', () => {
        const linkHrefMatch = htmlContent.match(/<link[^>]+href=['"](https?:)?\/\/[^'"]+['"]/gi);
        assert.strictEqual(linkHrefMatch, null, `Found external stylesheet: ${linkHrefMatch}`);
    });

    t.test('should not contain external @import in CSS', () => {
        const importMatch = htmlContent.match(/@import\s+['"](https?:)?\/\/[^'"]+['"]/gi) ||
                            htmlContent.match(/@import\s+url\(['"]?(https?:)?\/\/[^'"]+['"]?\)/gi);
        assert.strictEqual(importMatch, null, `Found external @import: ${importMatch}`);
    });

    t.test('should not contain external fonts or images in CSS via url()', () => {
        // Exclude data URIs and blob URIs (used for export)
        const urlMatch = htmlContent.match(/url\(['"]?(https?:)?\/\/[^'"]+['"]?\)/gi);
        if (urlMatch) {
            const externalUrls = urlMatch.filter(url => !url.includes('data:') && !url.includes('blob:'));
            assert.strictEqual(externalUrls.length, 0, `Found external URL in CSS: ${externalUrls}`);
        }
    });

    t.test('should not contain fetch() calls to external domains', () => {
        const fetchMatch = htmlContent.match(/fetch\(['"]?(https?:)?\/\/[^'"]+['"]?\)/gi);
        assert.strictEqual(fetchMatch, null, `Found fetch() to external domain: ${fetchMatch}`);
    });

    t.test('should not contain XMLHttpRequest calls to external domains', () => {
        const xhrMatch = htmlContent.match(/\.open\(['"]GET['"]\s*,\s*['"](https?:)?\/\/[^'"]+['"]/gi);
        assert.strictEqual(xhrMatch, null, `Found XHR to external domain: ${xhrMatch}`);
    });

    t.test('should have all CSS and JS inlined in the same file', () => {
        assert.ok(htmlContent.includes('<style>'), 'Missing inlined <style>');
        assert.ok(htmlContent.includes('<script>'), 'Missing inlined <script>');
    });
});
