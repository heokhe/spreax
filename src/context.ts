import { proxify } from './proxy';
import { Dict } from './types';
import { isElement } from './dom';

interface Listener {
  name: string;
  callback: VoidFunction;
}

export class Context<
  T extends Dict = Dict,
  P extends Dict = Dict,
  G extends Dict = Dict,
  C extends Dict = {}
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

  on(key: string, callback: VoidFunction, immediate = false) {
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

  set(key: string, value: any): void {
    key in this.state
      ? this.state[key] = value
      : this.parent?.set(key, value);
  }

  emit(key: string) {
    for (const l of this.allListeners) {
      if (l.name === key) {
        l.callback();
      }
    }
  }
}

export function findContext(node: Node): Context | undefined {
  if (isElement(node)) {
    let current = node;
    while (!current._ctx)
      current = current.parentElement;
    return current._ctx;
  }
  return findContext(node.parentElement);
}
