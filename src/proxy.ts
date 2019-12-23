import { isObject } from './utils';

/**
 * @param {*} object
 * @param {(key: string) => void} callback
 * @param {string[]} [pathPrefix]
 */
// export default function proxy(object, callback, pathPrefix = []) {
//   const map = {};
//   return new Proxy(object, {
//     get(o, key) {
//       const value = o[key];
//       if (isObject(value, true)) {
//         const path = [...pathPrefix, key],
//           keyMap = path.join('.');

//         if (!(keyMap in map)) {
//           map[keyMap] = proxy(value, callback, path);
//         }
//         return map[keyMap];
//       }
//       return value;
//     },
//     set(o, key, value) {
//       const path = [...pathPrefix, key],
//         keyMap = path.join('.');

//       if (path.length === 1 && !(key in o)) {
//         throw new Error(`unknown key "${keyMap}"`);
//       }

//       if (keyMap in map) {
//         map[keyMap] = proxy(value, callback, path);
//       }

//       const oldValue = o[key];
//       if (oldValue !== value) {
//         o[key] = value;
//         callback(keyMap, oldValue, value);
//       }
//       return true;
//     },
//     deleteProperty: (_, k) => {
//       return [...pathPrefix, k].length > 1;
//     }
//   });
// }

export function proxify<T extends object>(object: T, onSet: (key: string, value: any) => any): T {
  return new Proxy(object, {
    get: (obj, key) => obj[key],
    set(obj, key, newValue) {
      if (!(key in obj)) return false;
      const oldValue = obj[key];
      if (oldValue === newValue) return false;
      obj[key] = newValue;
      onSet(key.toString(), newValue)
    },
    deleteProperty: () => false
  })
}