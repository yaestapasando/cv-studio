/**
 * Tests for: Internal event bus (createEventBus / EventBus)
 * Verifies pub/sub behaviour, one-time listeners, and handler isolation.
 */

const fs   = require('fs');
const path = require('path');
const vm   = require('vm');

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

// ── createEventBus API ────────────────────────────────────────────────────────

describe('createEventBus — API shape', () => {
  let bus;
  beforeEach(() => {
    const CVStudio = makeSandbox();
    bus = CVStudio.createEventBus();
  });

  test('returns an object with on', () => {
    expect(typeof bus.on).toBe('function');
  });

  test('returns an object with off', () => {
    expect(typeof bus.off).toBe('function');
  });

  test('returns an object with emit', () => {
    expect(typeof bus.emit).toBe('function');
  });

  test('returns an object with once', () => {
    expect(typeof bus.once).toBe('function');
  });
});

// ── on / emit ─────────────────────────────────────────────────────────────────

describe('on(event, fn) + emit(event, data)', () => {
  let bus;
  beforeEach(() => {
    bus = makeSandbox().createEventBus();
  });

  test('calls handler when event is emitted', () => {
    const spy = jest.fn();
    bus.on('test', spy);
    bus.emit('test');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('passes data to handler', () => {
    let received;
    bus.on('data', function (d) { received = d; });
    bus.emit('data', { value: 42 });
    expect(received).toEqual({ value: 42 });
  });

  test('multiple handlers on same event are all called', () => {
    const spyA = jest.fn();
    const spyB = jest.fn();
    bus.on('evt', spyA);
    bus.on('evt', spyB);
    bus.emit('evt');
    expect(spyA).toHaveBeenCalledTimes(1);
    expect(spyB).toHaveBeenCalledTimes(1);
  });

  test('handlers on different events are isolated', () => {
    const spyA = jest.fn();
    const spyB = jest.fn();
    bus.on('a', spyA);
    bus.on('b', spyB);
    bus.emit('a');
    expect(spyA).toHaveBeenCalledTimes(1);
    expect(spyB).not.toHaveBeenCalled();
  });

  test('emitting unknown event does not throw', () => {
    expect(() => bus.emit('no-such-event')).not.toThrow();
  });

  test('returns an unsubscribe function', () => {
    const unsub = bus.on('x', jest.fn());
    expect(typeof unsub).toBe('function');
  });

  test('returned unsubscribe removes the handler', () => {
    const spy = jest.fn();
    const unsub = bus.on('x', spy);
    unsub();
    bus.emit('x');
    expect(spy).not.toHaveBeenCalled();
  });

  test('ignores non-function handler and returns a no-op', () => {
    expect(() => bus.on('evt', 'not-a-fn')).not.toThrow();
    const noop = bus.on('evt', 'not-a-fn');
    expect(typeof noop).toBe('function');
  });
});

// ── off ───────────────────────────────────────────────────────────────────────

describe('off(event, fn)', () => {
  let bus;
  beforeEach(() => {
    bus = makeSandbox().createEventBus();
  });

  test('removes a specific handler', () => {
    const spy = jest.fn();
    bus.on('e', spy);
    bus.off('e', spy);
    bus.emit('e');
    expect(spy).not.toHaveBeenCalled();
  });

  test('does not affect other handlers on same event', () => {
    const spyA = jest.fn();
    const spyB = jest.fn();
    bus.on('e', spyA);
    bus.on('e', spyB);
    bus.off('e', spyA);
    bus.emit('e');
    expect(spyA).not.toHaveBeenCalled();
    expect(spyB).toHaveBeenCalledTimes(1);
  });

  test('calling off for unknown event is safe', () => {
    expect(() => bus.off('unknown', jest.fn())).not.toThrow();
  });

  test('calling off with unknown handler is safe', () => {
    bus.on('e', jest.fn());
    expect(() => bus.off('e', jest.fn())).not.toThrow();
  });
});

// ── once ─────────────────────────────────────────────────────────────────────

describe('once(event, fn)', () => {
  let bus;
  beforeEach(() => {
    bus = makeSandbox().createEventBus();
  });

  test('calls handler exactly once', () => {
    const spy = jest.fn();
    bus.once('e', spy);
    bus.emit('e');
    bus.emit('e');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('passes data to once handler', () => {
    let received;
    bus.once('e', function (d) { received = d; });
    bus.emit('e', 'hello');
    expect(received).toBe('hello');
  });

  test('returned unsubscribe prevents the one-time call', () => {
    const spy = jest.fn();
    const unsub = bus.once('e', spy);
    unsub();
    bus.emit('e');
    expect(spy).not.toHaveBeenCalled();
  });

  test('ignores non-function and returns a no-op', () => {
    expect(() => bus.once('e', 42)).not.toThrow();
    const noop = bus.once('e', 42);
    expect(typeof noop).toBe('function');
  });
});

// ── emit during iteration safety ──────────────────────────────────────────────

describe('emit — handler mutation safety', () => {
  let bus;
  beforeEach(() => {
    bus = makeSandbox().createEventBus();
  });

  test('handlers added during emit are not called in the same cycle', () => {
    const late = jest.fn();
    bus.on('e', function () { bus.on('e', late); });
    bus.emit('e');
    expect(late).not.toHaveBeenCalled();
  });

  test('handlers removed during emit are still called in the same cycle (snapshot semantics)', () => {
    // emit() snapshots the handler list before iterating, matching Node.js EventEmitter behaviour.
    const spy = jest.fn();
    bus.on('e', function () { bus.off('e', spy); });
    bus.on('e', spy);
    bus.emit('e');
    expect(spy).toHaveBeenCalledTimes(1); // spy was in the snapshot, so it fires
    bus.emit('e'); // next emit: spy was removed, so no longer called
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

// ── EventBus singleton ────────────────────────────────────────────────────────

describe('EventBus — global singleton', () => {
  let CVStudio;
  beforeEach(() => {
    CVStudio = makeSandbox();
  });

  test('EventBus is exposed on window.CVStudio', () => {
    expect(CVStudio.EventBus).toBeDefined();
  });

  test('EventBus has on, off, emit, once', () => {
    const eb = CVStudio.EventBus;
    expect(typeof eb.on).toBe('function');
    expect(typeof eb.off).toBe('function');
    expect(typeof eb.emit).toBe('function');
    expect(typeof eb.once).toBe('function');
  });

  test('EventBus is separate instance from createEventBus()', () => {
    const fresh = CVStudio.createEventBus();
    const spy = jest.fn();
    CVStudio.EventBus.on('test', spy);
    fresh.emit('test');
    expect(spy).not.toHaveBeenCalled();
  });
});
