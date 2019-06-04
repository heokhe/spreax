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

export const getDeep = (object, path) => path.reduce((a, b) => a[b], object);

export const setDeep = (object, path, value) => {
  const last = path[path.length - 1];
  getDeep(object, path.slice(0, -1))[last] = value;
};
