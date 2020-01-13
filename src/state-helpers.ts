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

export function setIndex<T>(state: StateVariable<T[]>, index: number, newValue: T) {
  state.update(array => array.map((x, i) => i === index ? newValue : x));
}

export function splice<T>(state: StateVariable<T[]>, start: number, deleteCount: number, ...items: T[]) {
  const clone = [...state.value];
  clone.splice(start, deleteCount, ...items);
  state.set(clone)
}

export function inc(state: StateVariable<number>, x = 1) {
  state.update(n => n + x);
}

export function dec(state: StateVariable<number>, x = 1) {
  inc(state, -x);
}
