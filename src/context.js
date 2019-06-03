import proxy from './proxy';

function createAlias(key, target, source, enumerable = false) {
  Object.defineProperty(target, key, {
    get: () => source[key],
    set: v => { source[key] = v; },
    enumerable
  });
}

export default function createContext({
  state, methods, getters, onChange, thisArg
}) {
  const ctx = {},
    proxifiedState = proxy(state, key => {
      const sections = key.split('.');
      for (let i = 1; i <= sections.length; i++) {
        onChange(sections.slice(0, i).join('.'));
      }
      for (const gkey in getters) {
        // eslint-disable-next-line no-use-before-define
        updateGetter(gkey);
        onChange(gkey);
      }
    }),
    updateGetter = name => {
      const value = getters[name].call(thisArg, proxifiedState);
      if (!(name in ctx) || value !== ctx[name]) {
        Object.defineProperty(ctx, name, {
          writable: false,
          configurable: true,
          value
        });
      }
    };

  for (const key in proxifiedState) {
    createAlias(key, ctx, proxifiedState, true);
    createAlias(key, thisArg, ctx);
  }

  for (const object of [methods, getters]) {
    for (const key in object) {
      if (object === methods) {
        Object.defineProperty(ctx, key, {
          value: object[key].bind(thisArg),
          writable: false,
          configurable: false,
          enumerable: false
        });
      } else updateGetter(key);
      createAlias(key, thisArg, ctx);
    }
  }

  return ctx;
}
