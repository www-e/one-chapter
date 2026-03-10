/**
 * Unit tests for observable.ts
 */

import { Observable, EventEmitter } from './observable';

describe('Observable', () => {
  it('should initialize with default value', () => {
    const observable = new Observable<number>(42);

    expect(observable.get()).toBe(42);
  });

  it('should update value', () => {
    const observable = new Observable<number>(0);

    observable.set(10);

    expect(observable.get()).toBe(10);
  });

  it('should notify subscribers on value change', () => {
    const observable = new Observable<number>(0);
    const callback = jest.fn();

    observable.subscribe(callback);
    observable.set(5);

    expect(callback).toHaveBeenCalledWith(5);
  });

  it('should allow multiple subscribers', () => {
    const observable = new Observable<number>(0);
    const callback1 = jest.fn();
    const callback2 = jest.fn();

    observable.subscribe(callback1);
    observable.subscribe(callback2);
    observable.set(5);

    expect(callback1).toHaveBeenCalledWith(5);
    expect(callback2).toHaveBeenCalledWith(5);
  });

  it('should unsubscribe callback', () => {
    const observable = new Observable<number>(0);
    const callback = jest.fn();

    const unsubscribe = observable.subscribe(callback);
    unsubscribe();
    observable.set(5);

    expect(callback).not.toHaveBeenCalled();
  });

  it('should not notify when value is the same', () => {
    const observable = new Observable<number>(5);
    const callback = jest.fn();

    observable.subscribe(callback);
    observable.set(5);

    expect(callback).not.toHaveBeenCalled();
  });
});

describe('EventEmitter', () => {
  it('should register listeners and emit events', () => {
    const emitter = new EventEmitter<string>();
    const listener = jest.fn();

    emitter.on(listener);
    emitter.emit('test-event');

    expect(listener).toHaveBeenCalledWith('test-event');
  });

  it('should support multiple listeners', () => {
    const emitter = new EventEmitter<void>();
    const listener1 = jest.fn();
    const listener2 = jest.fn();

    emitter.on(listener1);
    emitter.on(listener2);
    emitter.emit();

    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
  });

  it('should return unsubscribe function', () => {
    const emitter = new EventEmitter<void>();
    const listener = jest.fn();

    const unsubscribe = emitter.on(listener);
    unsubscribe();
    emitter.emit();

    expect(listener).not.toHaveBeenCalled();
  });

  it('should handle events with data', () => {
    interface EventData {
      id: string;
      value: number;
    }

    const emitter = new EventEmitter<EventData>();
    const listener = jest.fn();

    emitter.on(listener);
    emitter.emit({ id: 'test', value: 42 });

    expect(listener).toHaveBeenCalledWith({ id: 'test', value: 42 });
  });
});
