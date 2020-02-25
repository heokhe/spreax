import { Subscribable } from '../core/subscribable';
import { evaluate } from '../parser/evaluate';
import { parse } from '../parser/parser';
import { hasSecretAttribute, getSecretAttribute } from '../dom';

export class Prop<T> extends Subscribable<T> {
  name: string;

  isOptional: boolean;

  constructor(value?: T) {
    super();
    this.isOptional = value !== undefined;
    if (this.isOptional)
      this.value = value;
  }

  set() {
    return undefined;
  }

  setFromAttribute(element: HTMLElement) {
    const value = hasSecretAttribute(element, this.name)
      ? evaluate(parse(getSecretAttribute(element, this.name)), {})
      : element.getAttribute(this.name);
    this.changeValue(value);
  }
}

export const prop = <T>(value?: T) => new Prop(value);
