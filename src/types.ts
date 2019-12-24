import { Context } from "./context"

/**
 * Dictionary.
 */
export type Dict<T = any> = {
  [x: string]: T;
}

export type SpreaxOptions<T extends Dict> = {
  el: Element;
  state: T;
}

declare global {
  interface Element {
    _ctx: Context;
  }
}