import { Subscribable } from "./subscribable";

export type Computable<T> = () => T;

export class DerivedVariable<T> extends Subscribable<T> {
  fn: Computable<T>;
  constructor(fn: Computable<T>) {
    super();
    this.fn = fn;
    this.compute();
  }
  compute() {
    this.changeValue(this.fn.call(null));
  }
  subscribeAndAutoCompute<T>(state: Subscribable<T>) {
    state.subscribe(() => this.compute())
  }
}

export function derived<T>(fn: Computable<T>) {
  return new DerivedVariable(fn);
}
