import { setDeep, safeClone } from './helpers';
import { Variable } from './core/variables';

export function push<T>(state: Variable<T[]>, ...items: T[]) {
  state.update(array => [...array, ...items]);
}

export function unshift<T>(state: Variable<T[]>, ...items: T[]) {
  state.update(array => [...items, ...array]);
}

export function merge<T extends object>(state: Variable<T>, sourceObject: {
  [x in keyof T]?: T[x]
}) {
  state.update(object => ({ ...object, ...sourceObject }));
}

export function set<
  T extends object,
  K extends keyof T
>(state: Variable<T>, key: K, value: T[K]) {
  state.update(object => ({ ...object, [key]: value }));
}

export function setPath(state: Variable<any>, path: string[], value: any) {
  state.update(object => {
    const cloned = safeClone(object);
    setDeep(cloned, path, value);
    return cloned;
  });
}

export function setIndex<T>(state: Variable<T[]>, index: number, newValue: T) {
  state.update(array => array.map((x, i) => (i === index ? newValue : x)));
}

export function splice<T>(
  state: Variable<T[]>, start: number, deleteCount: number, ...items: T[]
) {
  const clone = [...state.value];
  clone.splice(start, deleteCount, ...items);
  state.set(clone);
}

export function inc(state: Variable<number>, x = 1) {
  state.update(n => n + x);
}

export function dec(state: Variable<number>, x = 1) {
  inc(state, -x);
}
