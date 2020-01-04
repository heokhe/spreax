import { StateVariable } from "./state";

export function push<T>(state: StateVariable<T[]>, ...items: T[]) {
  state.update(array => [...array, ...items]);
}

export function unshift<T>(state: StateVariable<T[]>, ...items: T[]) {
  state.update(array => [...items, ...array]);
}

export function merge<T extends object>(state: StateVariable<T>, sourceObject: {
  [x in keyof T]?: T[x]
}) {
  state.update(object => ({ ...object, ...sourceObject }))
}

export function set<
  T extends object,
  K extends keyof T
>(state: StateVariable<T>, key: K, value: T[K]) {
  state.update(object => ({ ...object, [key]: value }));
}
