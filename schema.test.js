const test = require('node:test');
const assert = require('node:assert');

/**
 * CV State Schema Definition
 */
const initialState = {
    personalData: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        website: '',
        location: '',
        title: '',
        linkedin: '',
        github: ''
    },
    summary: '',
    experience: [], // Array of: { id, company, position, location, startDate, endDate, current, description }
    education: [],  // Array of: { id, institution, degree, field, location, startDate, endDate, current, description }
    skills: []      // Array of strings
};

test('CV Schema Structure', (t) => {
    t.test('should have all required top-level properties', () => {
        assert.ok(Object.hasOwn(initialState, 'personalData'), 'Missing personalData');
        assert.ok(Object.hasOwn(initialState, 'summary'), 'Missing summary');
        assert.ok(Object.hasOwn(initialState, 'experience'), 'Missing experience');
        assert.ok(Object.hasOwn(initialState, 'education'), 'Missing education');
        assert.ok(Object.hasOwn(initialState, 'skills'), 'Missing skills');
    });

    t.test('personalData should have all required fields', () => {
        const fields = ['firstName', 'lastName', 'email', 'phone', 'website', 'location', 'title', 'linkedin', 'github'];
        fields.forEach(field => {
            assert.ok(Object.hasOwn(initialState.personalData, field), `Missing personalData.${field}`);
        });
    });

    t.test('experience should be an array', () => {
        assert.ok(Array.isArray(initialState.experience), 'experience is not an array');
    });

    t.test('education should be an array', () => {
        assert.ok(Array.isArray(initialState.education), 'education is not an array');
    });

    t.test('skills should be an array', () => {
        assert.ok(Array.isArray(initialState.skills), 'skills is not an array');
    });
});
