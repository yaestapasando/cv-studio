const test = require('node:test');
const assert = require('node:assert');

const CVStudioMock = {
    isObject: function(item) {
        return (item && typeof item === 'object' && !Array.isArray(item));
    },
    mergeDeep: function(target, source) {
        if (!this.isObject(target) || !this.isObject(source)) {
            return source;
        }

        const output = Object.assign({}, target);
        Object.keys(source).forEach(key => {
            const targetValue = target[key];
            const sourceValue = source[key];

            if (this.isObject(targetValue) && this.isObject(sourceValue)) {
                output[key] = this.mergeDeep(targetValue, sourceValue);
            } else {
                output[key] = sourceValue;
            }
        });
        return output;
    }
};

test('MergeDeep Logic', (t) => {
    t.test('should merge simple properties', () => {
        const target = { a: 1 };
        const source = { b: 2 };
        const result = CVStudioMock.mergeDeep(target, source);
        assert.deepStrictEqual(result, { a: 1, b: 2 });
    });

    t.test('should override properties', () => {
        const target = { a: 1 };
        const source = { a: 2 };
        const result = CVStudioMock.mergeDeep(target, source);
        assert.deepStrictEqual(result, { a: 2 });
    });

    t.test('should merge nested objects', () => {
        const target = { personalData: { firstName: 'Juan' } };
        const source = { personalData: { lastName: 'Perez' } };
        const result = CVStudioMock.mergeDeep(target, source);
        assert.deepStrictEqual(result, { personalData: { firstName: 'Juan', lastName: 'Perez' } });
    });

    t.test('should override nested properties', () => {
        const target = { personalData: { firstName: 'Juan' } };
        const source = { personalData: { firstName: 'Pedro' } };
        const result = CVStudioMock.mergeDeep(target, source);
        assert.deepStrictEqual(result, { personalData: { firstName: 'Pedro' } });
    });

    t.test('should not merge arrays deeply (override)', () => {
        const target = { skills: ['JS'] };
        const source = { skills: ['HTML'] };
        const result = CVStudioMock.mergeDeep(target, source);
        assert.deepStrictEqual(result, { skills: ['HTML'] });
    });
});
