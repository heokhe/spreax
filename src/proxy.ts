import { isObject } from './utils';

type ProxyCallback = (key: string, value: any) => any;

export function proxify<T extends object>(object: T, onSet: ProxyCallback, pathPrefix: string[] = []): T {
  const map = new WeakMap<string[], object>();
  return new Proxy(object, {
    get(obj: T, key: string) {
      const value = obj[key];
      if (isObject(value)) {
        const path = [...pathPrefix, key];
        if (!map.has(path))
          map.set(path, proxify(value, onSet, [key]));
        return map.get(path);
      }
      return value;
    },
    set(obj: T, key: string, newValue) {
      const path = [...pathPrefix, key];
      const oldValue = obj[key];
      if (!(key in obj) && pathPrefix.length === 0) return false;
      if (oldValue === newValue) return false;
      if (isObject(oldValue)) {
        map.set(path, proxify(newValue, onSet, [key]));
        onSet(path.join('.'), newValue);
      } else {
        obj[key] = newValue;
      }
      onSet(path.join('.'), newValue);
      return true;
    },
    deleteProperty: () => pathPrefix.length > 0
  })
}