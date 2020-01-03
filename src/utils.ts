import { Dict } from "./types";

/**
 * Joins two arrays into eachother.
 * @example joinTwo([1,3,5], [2,4]) // '12345'
 */
export const joinTwo = (a, b) => {
  let s = '';
  for (let i = 0; i < a.length; i++) {
    s += a[i];
    if (i in b) {
      s += b[i];
    }
  }
  return s;
};

export const getDeep = (object, path) => {
  if (typeof path === 'string') path = path.split('.');
  return path.reduce((a, b) => a[b], object);
};

export const setDeep = (object, path, value) => {
  if (typeof path === 'string') path = path.split('.');
  const last = path[path.length - 1];
  getDeep(object, path.slice(0, -1))[last] = value;
};

export const isObject = (o: any): o is object => typeof o === 'object' && o !== null;

export const isEmptyObject = o => {
  for (const _ in o) return false;
  return true;
};

/**
 * @param {Array} arr
 * @example duplicateIndexes([1,2,2,3,3,3]) // [2,4,5]
 */
export const getDuplicateIndexes = arr => arr
  .map((x, i) => (i !== arr.indexOf(x) ? i : null))
  .filter(e => e !== null);

export const isKeyOf = <T>(o: T, k: string | number | symbol): k is keyof T => {
  return k in o;
}

export function splitWithOffset(string: string, regex: RegExp) {
  const results: [string, number][] = [];
  let index = regex.lastIndex,
    match = regex.exec(string);
  while (match) {
    results.push([string.substring(index, match.index), index]);
    index = regex.lastIndex;
    match = regex.exec(string);
  }
  results.push([string.substring(index), index]);
  return results;
}
