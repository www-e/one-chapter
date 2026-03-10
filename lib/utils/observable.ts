/**
 * Simple Observable Utility
 * EventEmitter-based pattern for reactive updates
 * Replaces WatermelonDB's observe() functionality
 */

type Listener<T> = (data: T) => void;
type Unsubscribe = () => void;

/**
 * Simple observable class for reactive data streams
 */
export class Observable<T> {
  private listeners: Set<Listener<T>> = new Set();

  constructor(private value: T) {}

  /**
   * Get current value
   */
  get(): T {
    return this.value;
  }

  /**
   * Update value and notify all listeners
   */
  set(newValue: T): void {
    this.value = newValue;
    this.notify();
  }

  /**
   * Subscribe to changes
   * Returns unsubscribe function
   */
  subscribe(listener: Listener<T>): Unsubscribe {
    this.listeners.add(listener);

    // Immediately call with current value
    listener(this.value);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners
   */
  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.value);
      } catch (error) {
        console.error('Error in observable listener:', error);
      }
    });
  }
}

/**
 * Observable count for tracking counts
 */
export class ObservableCount {
  private listeners: Set<(count: number) => void> = new Set();

  constructor(private count: number) {}

  /**
   * Get current count
   */
  get(): number {
    return this.count;
  }

  /**
   * Update count
   */
  set(newCount: number): void {
    if (this.count !== newCount) {
      this.count = newCount;
      this.notify();
    }
  }

  /**
   * Increment count
   */
  increment(): void {
    this.set(this.count + 1);
  }

  /**
   * Decrement count
   */
  decrement(): void {
    this.set(this.count - 1);
  }

  /**
   * Subscribe to count changes
   */
  subscribe(listener: (count: number) => void): Unsubscribe {
    this.listeners.add(listener);
    listener(this.count);

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.count);
      } catch (error) {
        console.error('Error in count listener:', error);
      }
    });
  }
}

/**
 * Simple event emitter for general events
 */
export class EventEmitter<T = void> {
  private listeners: Set<Listener<T>> = new Set();

  /**
   * Subscribe to events
   */
  on(listener: Listener<T>): Unsubscribe {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Emit event to all listeners
   */
  emit(data: T): void {
    this.listeners.forEach((listener) => {
      try {
        listener(data);
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    });
  }

  /**
   * Clear all listeners
   */
  clear(): void {
    this.listeners.clear();
  }
}
