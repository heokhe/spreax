import proxy from './proxy';
import { getDeep, setDeep } from './utils';

export function createAlias(key, source, target, writable = true) {
  if (key in target) throw new Error(`cannot create alias "${key}": this property already exists`);

  Object.defineProperty(target, key, {
    get: () => source[key],
    set: v => {
      if (writable) source[key] = v;
      return writable;
    }
  });
}

export default class Context {
  constructor({
    state: rawState = {}, methods = {}, getters = {},
    instance, staticData = {}
  }) {
    /** @type {Listener[]} */
    this.$listeners = [];
    this.$instance = instance;
    this.$rawState = rawState;

    const inner = {};
    this.$inner = inner;

    const state = proxy(rawState, key => {
      const sections = key.split('.');
      for (let i = 1; i <= sections.length; i++) {
        this.$emit(sections.slice(0, i).join('.'));
      }
      for (const gkey in getters) {
        this.$setGetter(gkey);
      }
    });
    this.$state = state;
    for (const k in state) {
      createAlias(k, state, this.$inner);
      createAlias(k, this.$inner, this);
    }

    this.$getterFunctions = getters;
    for (const key in getters) {
      this.$setGetter(key);
      createAlias(key, this.$inner, this);
    }

    const newMethods = {};
    for (const key in methods) {
      newMethods[key] = methods[key].bind(instance);
      createAlias(key, newMethods, this.$inner);
      createAlias(key, this.$inner, this);
    }
    this.$methods = newMethods;

    for (const key in staticData) {
      createAlias(key, staticData, this.$inner, false);
      createAlias(key, staticData, this, false);
    }
  }

  /**
   * Re-computes the value of a getter.
   * @param {string} name
   */
  $setGetter(name) {
    const inner = this.$inner,
      value = this.$getterFunctions[name].call(this.$instance, this.$state),
      exists = name in inner;

    if (!exists || value !== inner[name]) {
      Object.defineProperty(inner, name, {
        writable: false,
        configurable: true,
        value,
        enumerable: true
      });
    }
    if (exists) this.$emit(name);
  }

  /** @param {string|string[]} path */
  $get(path) {
    return getDeep(this.$inner, path);
  }

  /**
   * @param {string|string[]} path
   * @param {*} value
   */
  $set(path, value) {
    setDeep(this.$inner, path, value);
  }

  /**
   * @typedef {{ type: string, value: * }} SpreaxEvent
   * @typedef {(event: SpreaxEvent) => void} SpreaxEventCallback
   * @typedef {{ key: string, fn: SpreaxEventCallback }} Listener
   * @param {string} key
   * @param {(event: SpreaxEvent) => void} callback
   * @param {boolean} [immediate]
   */
  $on(key, callback, immediate = false) {
    const id = this.$listeners.push({
      key, fn: callback.bind(this.$instance)
    }) - 1;
    if (immediate) this.$emit(id);
  }

  /** @param {string|number} keyOrId */
  $emit(keyOrId) {
    const listeners = this.$listeners,
      { length } = listeners,
      isId = typeof keyOrId === 'number';

    for (let i = 0; i < length; i++) {
      const { key, fn } = listeners[i];
      if (keyOrId === (isId ? i : key)) {
        fn({
          type: key,
          value: this.$get(key)
        });
      }
    }
  }

  /** @returns {string[]} */
  get $keys() {
    return Object.keys(
      Object.getOwnPropertyDescriptors(this.$inner)
    );
  }
}
