import {
  getAllNodes, getDirectives, isText, isElement
} from './dom';
import createTemplate from './template';
import { DIRECTIVES } from './directives';
import proxy from './proxy';
import './directives/builtins';
import observe from './observer';

/**
 * @typedef {(value: string) => string} Formatter
 * @typedef {{ key: string, fn: (this: Spreax) => void }} SpreaxEvent
 * @typedef {Object} ConstructorOptions
 * @property {Element} el
 * @property {Object} state
 * @property {Object<string, () => void>} [methods]
 * @property {Object<string, (this: Spreax, state: Object) => any} [getters]
 * @property {Object<string, Formatter>} [formatters]
 */

class Spreax {
  /** @param {ConstructorOptions} options */
  constructor({
    el, state, methods = {}, getters = {}, formatters = {}
  }) {
    el._sp = this;
    this.$el = el;

    /** @type {SpreaxEvent[]} */
    this.$events = [];

    const setGetters = () => {
      for (const key in getters) {
        const value = getters[key].call(this, this.$state);
        if (!(key in this) || value !== this[key]) {
          Object.defineProperty(this, key, {
            writable: false,
            configurable: true,
            value
          });
          this.$emit(key);
        }
      }
    };
    this.$state = proxy(state, path => {
      this.$emit(path.join('.'));
      setGetters();
    });
    setGetters();

    for (const key in this.$state) {
      Object.defineProperty(this, key, {
        get: () => this.$state[key],
        set: v => { this.$state[key] = v; }
      });
    }
    for (const key in methods) this[key] = methods[key].bind(this);
    this.$formatters = formatters;

    getAllNodes(el).forEach(n => this.$handleNode(n));

    observe(el, this.$handleNode.bind(this));
  }

  /** @param {Node|Element} target */
  $handleNode(target) {
    if (isText(target)) {
      const text = target.textContent;
      if (/^\s*$/.test(text)) return;

      const template = createTemplate(text, this.$formatters);
      for (const v of template.vars) {
        this.$on(v, () => {
          target.textContent = template.render(this);
        }, { immediate: true });
      }
    } else if (isElement(target)) {
      for (const {
        name, options, param, value
      } of getDirectives(target)) {
        if (name in DIRECTIVES) {
          DIRECTIVES[name].execute(this, target, param, value, options);
        }
      }
    }
  }

  $on(key, callback, { immediate = false } = {}) {
    this.$events.push({ key, fn: callback.bind(this) });
    if (immediate) this.$emit(this.$events.length - 1);
  }

  $emit(keyOrId) {
    const events = this.$events,
      isId = typeof keyOrId === 'number';
    for (let i = 0; i < events.length; i++) {
      const { key, fn } = events[i];
      if (keyOrId === (isId ? i : key)) fn();
    }
  }
}

export { Directive, register } from './directives';
export default Spreax;
