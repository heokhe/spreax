import { Subscribable } from "./subscribable";

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
}

export function computed<T>(fn: Computable<T>) {
  return new ComputedVariable(fn);
}
