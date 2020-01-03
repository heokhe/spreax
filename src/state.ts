import { Subscribable } from "./subscribable";

export class StateVariable<T> extends Subscribable<T> {
  constructor(value: T) {
    super();
    this.value = value;
  }
  set(newValue: T) {
    if (this.value !== newValue) {
      this.value = newValue;
      this.push();
    }
  }
  update(fn: (value: T) => T) {
    this.set(fn(this.value));
  }
}

export function state<T>(value: T) {
  return new StateVariable(value);
}
