import { proxify } from './proxy';
import { Object } from './types';

interface Listener {
  name: string,
  callback: VoidFunction
}

export class Context<
  T extends Object = Object,
  P extends Object = Object,
  G extends Object = Object,
  C extends Object = {}
> {
  state: T;
  listeners: Listener[];
  parent?: Context<P, G>;
  constants?: C;
  childs: Context[];
  constructor(state: T, parent?: Context<P, G>, constants?: C) {
    this.state = proxify(state, key => this.emit(key));
    this.listeners = [];
    this.childs = [];
    if (parent) {
      this.parent = parent;
      parent.childs.push(this);
    }
    this.constants = constants;
  }

  on(key: string, callback: VoidFunction, immediate: boolean = false) {
    this.listeners.push({
      name: key,
      callback
    });
    if (immediate) callback();
  }

  get allListeners(): Listener[] {
    return [...this.listeners, ...(this.childs.map(ch => ch.allListeners).flat(Infinity))]
  }

  get(key: string): any {
    return key in this.state
      ? this.state[key]
      : this.constants?.hasOwnProperty(key)
      ? this.constants?.[key]
      : this.parent?.get(key);
  }

  emit(key: string) {
    for (const l of this.allListeners) {
      if (l.name === key) {
        l.callback();
      }
    }
  }
}
