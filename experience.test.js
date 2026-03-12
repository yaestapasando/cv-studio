const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('Experience section structure', (t) => {
    const htmlPath = path.join(__dirname, 'index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    t.test('should have a button to add experience', () => {
        assert.ok(htmlContent.includes('id="add-experience"'), 'Missing add-experience button id');
    });

    t.test('should have an experience list container', () => {
        assert.ok(htmlContent.includes('id="experience-list"'), 'Missing experience-list container id');
    });

    t.test('should have styles for experience items', () => {
        assert.ok(htmlContent.includes('.experience-item'), 'Missing .experience-item CSS class');
        assert.ok(htmlContent.includes('.experience-item-header'), 'Missing .experience-item-header CSS class');
    });

    t.test('should have preview styles for CV items', () => {
        assert.ok(htmlContent.includes('.cv-item'), 'Missing .cv-item CSS class');
        assert.ok(htmlContent.includes('.cv-section-title'), 'Missing .cv-section-title CSS class');
    });
});

test('Experience logic in script', (t) => {
    const htmlPath = path.join(__dirname, 'index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    t.test('should have addExperience function', () => {
        assert.ok(htmlContent.includes('addExperience: function'), 'Missing addExperience function');
    });

    t.test('should have removeExperience function', () => {
        assert.ok(htmlContent.includes('removeExperience: function'), 'Missing removeExperience function');
    });

    t.test('should have moveExperience function', () => {
        assert.ok(htmlContent.includes('moveExperience: function'), 'Missing moveExperience function');
    });

    t.test('should have renderExperienceEditor function', () => {
        assert.ok(htmlContent.includes('renderExperienceEditor: function'), 'Missing renderExperienceEditor function');
    });
    
    t.test('should include experience in render preview', () => {
        assert.ok(htmlContent.includes('const { personalData, summary, experience } = this.state;'), 'render should extract experience from state');
        assert.ok(htmlContent.includes('experience.map'), 'render should map through experience array');
    });
});
