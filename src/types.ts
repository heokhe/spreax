import { Context } from "./context"

/**
 * Dictionary.
 */
export type Dict<T = any> = {
  [key: string]: T;
}

export type State = Dict;
export type Methods = Dict<Function>;

export interface Listener {
  name: string;
  callback: VoidFunction;
}

export type SpreaxOptions<T extends Dict> = {
  el: Element;
  state: T;
}

export type ContextOptions<T extends Dict, M extends Methods, C extends Dict> = {
  state: T,
  methods: M,
  constants?: C,
  parent?: Context
}

declare global {
  interface Element {
    _ctx: Context | undefined;
  }
}