import { Subscription } from "./subscribable";
import { Variables, Variable } from "./variables";

export abstract class Subscriber<C> {
  context: Variables<C>

  constructor() {
    this.context = {} as Variables<C>;
  }

  subscribeTo<K extends keyof C, V extends Variable<C[K]>>(name: K, value: V) {
    this.context[name] = value;
  }

  listenFor<K extends keyof C>(name: K, callback: Subscription<C[K]>, immediate = false) {
    const variable = this.context[name];
    variable?.subscribe(callback, immediate);
  }
}
