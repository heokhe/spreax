import { Subscribable } from './subscribable';

export class StateVariable<T> extends Subscribable<T> {
  constructor(value: T) {
    super();
    this.value = value;
  }

  set(newValue: T) {
    this.changeValue(newValue);
  }
}

export function state<T>(value: T) {
  return new StateVariable(value);
}
