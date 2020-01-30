import { Subscribable } from './subscribable';

type DerivedFn<T> = () => T;

export class DerivedVariable<T> extends Subscribable<T> {
  fn: DerivedFn<T>;

  constructor(fn: DerivedFn<T>) {
    super();
    this.fn = fn;
    this.compute();
  }

  compute() {
    this.changeValue(this.fn.call(null));
  }

  subscribeAndAutoCompute<T>(state: Subscribable<T>) {
    state.subscribe(() => this.compute());
  }
}

export function derived<T>(fn: DerivedFn<T>) {
  return new DerivedVariable(fn);
}
