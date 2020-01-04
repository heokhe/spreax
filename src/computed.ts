import { Subscribable } from "./subscribable";
import { StateVariable } from "./state";

export type Computable<T> = () => T;

export class ComputedVariable<T> extends Subscribable<T> {
  fn: Computable<T>;
  constructor(fn: Computable<T>) {
    super();
    this.fn = fn;
    this.compute();
  }
  compute() {
    const newValue = this.fn();
    if (newValue !== this.value) {
      this.value = newValue;
      this.push();
    }
  }
  subscribeAndAutoCompute<T>(state: StateVariable<T>) {
    state.subscribe(() => this.compute())
  }
}

export function computed<T>(fn: Computable<T>) {
  return new ComputedVariable(fn);
}
