const test = require('node:test');
const assert = require('node:assert');

const CVStudioMock = {
    isObject: function(item) {
        return (item && typeof item === 'object' && !Array.isArray(item));
    },
    validateData: function(data) {
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            return { valid: false, error: 'Los datos deben ser un objeto JSON.' };
        }

        const requiredTopLevel = ['personalData', 'summary', 'experience', 'education', 'skills'];
        for (const key of requiredTopLevel) {
            if (!(key in data)) {
                return { valid: false, error: `Falta la sección obligatoria: ${key}` };
            }
        }

        if (!this.isObject(data.personalData)) {
            return { valid: false, error: 'personalData debe ser un objeto.' };
        }

        if (!Array.isArray(data.experience)) {
            return { valid: false, error: 'experience debe ser un array.' };
        }

        if (!Array.isArray(data.education)) {
            return { valid: false, error: 'education debe ser un array.' };
        }

        if (!Array.isArray(data.skills)) {
            return { valid: false, error: 'skills debe ser un array.' };
        }

        return { valid: true };
    }
};

test('Import Validation Logic', (t) => {
    t.test('should validate correct data', () => {
        const data = {
            personalData: {},
            summary: '',
            experience: [],
            education: [],
            skills: []
        };
        const result = CVStudioMock.validateData(data);
        assert.strictEqual(result.valid, true);
    });

    t.test('should fail if data is not an object', () => {
        const result = CVStudioMock.validateData([]);
        assert.strictEqual(result.valid, false);
        assert.strictEqual(result.error, 'Los datos deben ser un objeto JSON.');
    });

    t.test('should fail if missing top-level section', () => {
        const data = {
            personalData: {},
            summary: '',
            experience: [],
            education: []
            // missing skills
        };
        const result = CVStudioMock.validateData(data);
        assert.strictEqual(result.valid, false);
        assert.ok(result.error.includes('skills'));
    });

    t.test('should fail if personalData is not an object', () => {
        const data = {
            personalData: [],
            summary: '',
            experience: [],
            education: [],
            skills: []
        };
        const result = CVStudioMock.validateData(data);
        assert.strictEqual(result.valid, false);
        assert.ok(result.error.includes('personalData'));
    });

    t.test('should fail if experience is not an array', () => {
        const data = {
            personalData: {},
            summary: '',
            experience: {},
            education: [],
            skills: []
        };
        const result = CVStudioMock.validateData(data);
        assert.strictEqual(result.valid, false);
        assert.ok(result.error.includes('experience'));
    });
});
