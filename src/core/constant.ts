import { Subscribable } from './subscribable';

export class Constant<T> extends Subscribable<T> {
  // eslint-disable-next-line no-useless-constructor
  constructor(value: T) {
    super();
    this.value = value;
  }

  set() {
    return undefined;
  }
}

export const constant = <T>(value: T) => new Constant(value);
