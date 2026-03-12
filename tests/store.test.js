/**
 * Tests for: Minimal reactive state store (createStore / CVStore)
 * Verifies pub/sub behaviour, immutability, and integration with DEFAULT_CV.
 */

const fs   = require('fs');
const path = require('path');
const vm   = require('vm');

// ── Load CVStudio from index.html ────────────────────────────────────────────

const html     = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const srcMatch = html.match(/<script[^>]*>([\s\S]*?)<\/script>/);
const src      = srcMatch ? srcMatch[1] : '';

function makeSandbox() {
  const sandbox = {
    window:   {},
    document: { readyState: 'complete', getElementById: () => null, querySelectorAll: () => [] },
  };
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox);
  return sandbox.window.CVStudio;
}

// ── createStore API ──────────────────────────────────────────────────────────

describe('createStore — API shape', () => {
  let store;
  beforeEach(() => {
    const CVStudio = makeSandbox();
    store = CVStudio.createStore({ count: 0, name: 'test' });
  });

  test('returns an object with getState', () => {
    expect(typeof store.getState).toBe('function');
  });

  test('returns an object with setState', () => {
    expect(typeof store.setState).toBe('function');
  });

  test('returns an object with subscribe', () => {
    expect(typeof store.subscribe).toBe('function');
  });

  test('returns an object with unsubscribe', () => {
    expect(typeof store.unsubscribe).toBe('function');
  });
});

// ── getState ─────────────────────────────────────────────────────────────────

describe('getState()', () => {
  let store;
  beforeEach(() => {
    const CVStudio = makeSandbox();
    store = CVStudio.createStore({ count: 0, nested: { x: 1 } });
  });

  test('returns initial state values', () => {
    expect(store.getState().count).toBe(0);
  });

  test('returns a copy — mutating result does not affect stored state', () => {
    const s = store.getState();
    s.count = 99;
    expect(store.getState().count).toBe(0);
  });

  test('returns a deep copy — mutating nested object does not affect stored state', () => {
    const s = store.getState();
    s.nested.x = 42;
    expect(store.getState().nested.x).toBe(1);
  });
});

// ── setState — function updater ───────────────────────────────────────────────

describe('setState(fn)', () => {
  let store;
  beforeEach(() => {
    const CVStudio = makeSandbox();
    store = CVStudio.createStore({ count: 0, label: 'a' });
  });

  test('updates state via function updater', () => {
    store.setState(function (s) { return Object.assign({}, s, { count: 5 }); });
    expect(store.getState().count).toBe(5);
  });

  test('function updater receives current state', () => {
    store.setState(function (s) { return Object.assign({}, s, { count: s.count + 10 }); });
    expect(store.getState().count).toBe(10);
  });

  test('function updater receives a copy — mutating it does not corrupt state', () => {
    store.setState(function (s) {
      s.label = 'mutated-during-update';
      return s;
    });
    // A second call should still see 'mutated-during-update' as the result
    store.setState(function (s) { return Object.assign({}, s, { count: 1 }); });
    expect(store.getState().label).toBe('mutated-during-update');
    expect(store.getState().count).toBe(1);
  });
});

// ── setState — object patch ───────────────────────────────────────────────────

describe('setState(object)', () => {
  let store;
  beforeEach(() => {
    const CVStudio = makeSandbox();
    store = CVStudio.createStore({ a: 1, b: 2 });
  });

  test('shallow-merges patch into current state', () => {
    store.setState({ a: 99 });
    expect(store.getState().a).toBe(99);
    expect(store.getState().b).toBe(2);
  });

  test('does not mutate the patch object', () => {
    const patch = { a: 7 };
    store.setState(patch);
    patch.a = 100;
    expect(store.getState().a).toBe(7);
  });

  test('ignores non-object, non-function values', () => {
    store.setState(null);
    store.setState(42);
    store.setState('string');
    expect(store.getState().a).toBe(1);
  });
});

// ── subscribe ────────────────────────────────────────────────────────────────

describe('subscribe(fn)', () => {
  let store;
  beforeEach(() => {
    const CVStudio = makeSandbox();
    store = CVStudio.createStore({ x: 0 });
  });

  test('calls listener when state changes', () => {
    const spy = jest.fn();
    store.subscribe(spy);
    store.setState({ x: 1 });
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('listener receives new state snapshot', () => {
    let received;
    store.subscribe(function (state) { received = state; });
    store.setState({ x: 7 });
    expect(received.x).toBe(7);
  });

  test('listener snapshot is a copy — mutating it does not affect stored state', () => {
    store.subscribe(function (state) { state.x = 999; });
    store.setState({ x: 3 });
    expect(store.getState().x).toBe(3);
  });

  test('multiple listeners are all called', () => {
    const spyA = jest.fn();
    const spyB = jest.fn();
    store.subscribe(spyA);
    store.subscribe(spyB);
    store.setState({ x: 1 });
    expect(spyA).toHaveBeenCalledTimes(1);
    expect(spyB).toHaveBeenCalledTimes(1);
  });

  test('returns an unsubscribe function', () => {
    const unsub = store.subscribe(jest.fn());
    expect(typeof unsub).toBe('function');
  });

  test('returned unsubscribe stops future notifications', () => {
    const spy = jest.fn();
    const unsub = store.subscribe(spy);
    unsub();
    store.setState({ x: 1 });
    expect(spy).not.toHaveBeenCalled();
  });

  test('ignores non-function argument and returns a no-op', () => {
    expect(() => store.subscribe('not-a-fn')).not.toThrow();
    const noop = store.subscribe('not-a-fn');
    expect(typeof noop).toBe('function');
  });
});

// ── unsubscribe ───────────────────────────────────────────────────────────────

describe('unsubscribe(fn)', () => {
  let store;
  beforeEach(() => {
    const CVStudio = makeSandbox();
    store = CVStudio.createStore({ x: 0 });
  });

  test('stops calling the removed listener', () => {
    const spy = jest.fn();
    store.subscribe(spy);
    store.unsubscribe(spy);
    store.setState({ x: 1 });
    expect(spy).not.toHaveBeenCalled();
  });

  test('does not affect other listeners', () => {
    const spyA = jest.fn();
    const spyB = jest.fn();
    store.subscribe(spyA);
    store.subscribe(spyB);
    store.unsubscribe(spyA);
    store.setState({ x: 1 });
    expect(spyA).not.toHaveBeenCalled();
    expect(spyB).toHaveBeenCalledTimes(1);
  });

  test('calling unsubscribe with unknown function is safe', () => {
    expect(() => store.unsubscribe(jest.fn())).not.toThrow();
  });
});

// ── CVStore integration ───────────────────────────────────────────────────────

describe('CVStore — integration with DEFAULT_CV', () => {
  let CVStudio;
  beforeEach(() => {
    CVStudio = makeSandbox();
  });

  test('CVStore is exposed on window.CVStudio', () => {
    expect(CVStudio.CVStore).toBeDefined();
  });

  test('CVStore initial state matches DEFAULT_CV shape', () => {
    const state = CVStudio.CVStore.getState();
    expect(typeof state.personal).toBe('object');
    expect(Array.isArray(state.experience)).toBe(true);
    expect(typeof state.meta).toBe('object');
  });

  test('CVStore state is a copy — does not share reference with DEFAULT_CV', () => {
    const state = CVStudio.CVStore.getState();
    state.summary = 'mutated';
    expect(CVStudio.DEFAULT_CV.summary).toBe('');
  });

  test('updating CVStore does not mutate DEFAULT_CV', () => {
    CVStudio.CVStore.setState(function (s) {
      return Object.assign({}, s, { summary: 'changed' });
    });
    expect(CVStudio.DEFAULT_CV.summary).toBe('');
  });

  test('CVStore.setState notifies subscribers', () => {
    const spy = jest.fn();
    CVStudio.CVStore.subscribe(spy);
    CVStudio.CVStore.setState({ summary: 'hello' });
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
