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
  getDeep(object, path.slice(0, -1))[path[path.length - 1]] = value;
};
