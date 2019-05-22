/**
 * @param {*} object
 * @param {(path: string[]) => void} callback
 * @param {string[]} [pathPrefix]
 */
export default function proxy(object, callback, pathPrefix = []) {
  const map = {};
  return new Proxy(object, {
    get(o, key) {
      const value = o[key];
      if (typeof value === 'object') {
        const path = [...pathPrefix, key],
          keyMap = path.join('.');

        if (!(keyMap in map)) {
          map[keyMap] = proxy(value, callback, path);
        }
        return map[keyMap];
      }
      return value;
    },
    set(o, key, value) {
      const path = [...pathPrefix, key],
        keyMap = path.join('.');

      if (keyMap in map) {
        map[keyMap] = proxy(value, callback, path);
      }

      const oldValue = o[key];
      if (oldValue === value) return false;
      o[key] = value;
      callback(path, oldValue, value);
      return true;
    }
  });
}
