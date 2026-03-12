const test = require('node:test');
const assert = require('node:assert');

// Mock simple de la aplicación para probar la lógica de reactividad aislada
const CVStudioMock = {
    renderCalled: 0,
    saveCalled: 0,
    
    render: function() {
        this.renderCalled++;
    },
    
    debouncedSave: function() {
        this.saveCalled++;
    },

    createReactiveState: function(initialState) {
        const self = this;
        const proxiedObjects = new WeakMap();

        const createProxy = (obj) => {
            if (proxiedObjects.has(obj)) {
                return proxiedObjects.get(obj);
            }

            const handler = {
                get(target, key) {
                    const value = target[key];
                    if (typeof value === 'object' && value !== null) {
                        return createProxy(value);
                    }
                    return value;
                },
                set(target, key, value) {
                    if (target[key] === value) return true;
                    target[key] = value;
                    self.render();
                    self.debouncedSave();
                    return true;
                },
                deleteProperty(target, key) {
                    const deleted = delete target[key];
                    if (deleted) {
                        self.render();
                        self.debouncedSave();
                    }
                    return deleted;
                }
            };

            const proxy = new Proxy(obj, handler);
            proxiedObjects.set(obj, proxy);
            return proxy;
        };

        return createProxy(initialState);
    }
};

test('Reactivity Logic', (t) => {
    const initialState = {
        personalData: { firstName: 'Juan' },
        skills: ['JS']
    };
    
    const state = CVStudioMock.createReactiveState(initialState);
    
    t.test('should trigger render on top-level property change', () => {
        CVStudioMock.renderCalled = 0;
        state.summary = 'New summary';
        assert.strictEqual(CVStudioMock.renderCalled, 1, 'Render should be called once');
    });

    t.test('should trigger render on nested property change', () => {
        CVStudioMock.renderCalled = 0;
        state.personalData.firstName = 'Pedro';
        assert.strictEqual(CVStudioMock.renderCalled, 1, 'Render should be called once for nested change');
    });

    t.test('should trigger render on array modification (push)', () => {
        CVStudioMock.renderCalled = 0;
        state.skills.push('HTML');
        // push calls set for the new index and set for length
        assert.ok(CVStudioMock.renderCalled >= 1, 'Render should be called at least once for array push');
    });

    t.test('should not trigger render if value is the same', () => {
        CVStudioMock.renderCalled = 0;
        state.summary = 'New summary'; // Same as before
        assert.strictEqual(CVStudioMock.renderCalled, 0, 'Render should not be called for same value');
    });
});
