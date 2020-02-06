import { Subscribable } from './subscribable';

export class Constant<T> extends Subscribable<T> {
  constructor(value: T) {
    super();
    this.value = value;
  }

  set() {
    return undefined;
  }
}

export const constant = <T>(value: T) => new Constant(value);
