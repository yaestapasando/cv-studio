const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('Education section structure', (t) => {
    const htmlPath = path.join(__dirname, 'index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    t.test('should have a section for education in the editor', () => {
        assert.ok(htmlContent.includes('Educación / Formación'), 'Missing Educación / Formación heading');
    });

    t.test('should have a button to add education', () => {
        assert.ok(htmlContent.includes('id="add-education"'), 'Missing add-education button id');
    });

    t.test('should have an education list container', () => {
        assert.ok(htmlContent.includes('id="education-list"'), 'Missing education-list container id');
    });

    t.test('should have styles for education items (using common item class)', () => {
        // We can reuse .experience-item styles or create new ones, 
        // but it's likely we'll use a common class or similar.
        // Let's check if we should add .education-item.
        // Based on experience.test.js, it expects .experience-item.
        // I might want to generalize this or add education-specific ones.
    });
});

test('Education logic in script', (t) => {
    const htmlPath = path.join(__dirname, 'index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    t.test('should have addEducation function', () => {
        assert.ok(htmlContent.includes('addEducation: function'), 'Missing addEducation function');
    });

    t.test('should have removeEducation function', () => {
        assert.ok(htmlContent.includes('removeEducation: function'), 'Missing removeEducation function');
    });

    t.test('should have moveEducation function', () => {
        assert.ok(htmlContent.includes('moveEducation: function'), 'Missing moveEducation function');
    });

    t.test('should have renderEducationEditor function', () => {
        assert.ok(htmlContent.includes('renderEducationEditor: function'), 'Missing renderEducationEditor function');
    });

    t.test('should have fields for education item (institution, degree, startDate, endDate)', () => {
        assert.ok(htmlContent.includes('education.${index}.institution'), 'Missing institution data-path');
        assert.ok(htmlContent.includes('education.${index}.degree'), 'Missing degree data-path');
        assert.ok(htmlContent.includes('education.${index}.startDate'), 'Missing startDate data-path');
        assert.ok(htmlContent.includes('education.${index}.endDate'), 'Missing endDate data-path');
    });
    
    t.test('should include education in render preview', () => {
        assert.ok(htmlContent.includes('education.map'), 'render should map through education array');
        assert.ok(htmlContent.includes('edu.degree'), 'render should include edu.degree in preview');
        assert.ok(htmlContent.includes('edu.institution'), 'render should include edu.institution in preview');
    });
});
