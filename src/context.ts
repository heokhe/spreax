import { proxify } from './proxy';
import { Dict, Listener, Methods, ContextOptions } from './types';
import { isElement } from './dom';

export class Context<T extends Dict = Dict, M extends Methods = Dict, C extends Dict = {}> {
  state: T;
  listeners: Listener[];
  parent?: Context;
  constants?: C;
  methods: M;
  childs: Context[];
  constructor({ state, parent, constants, methods }: ContextOptions<T, M, C>) {
    this.state = proxify(state, key => this.emit(key));
    this.listeners = [];
    this.childs = [];
    this.methods = methods;
    if (parent) {
      this.parent = parent;
      parent.childs.push(this);
    }
    this.constants = constants;
  }

  on(key: string, callback: VoidFunction, immediate = false): void {
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

  getMethod(method: string): Function | undefined {
    return method in this.methods
      ? this.methods[method]
      : this.parent?.getMethod(method);
  }

  set(key: string, value: any): void {
    return key in this.state
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
