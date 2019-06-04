import {
  getDirectives, getAllNodes, isText, isElement
} from './dom';
import createTemplate from './template';
import { execute } from './directives';
import './directives/builtins';
import observe from './observer';
import createContext from './context';
import findSelector from './findSelector';

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

export class Spreax {
  /** @param {ConstructorOptions} options */
  constructor({
    el, state, methods = {}, getters = {}, formatters = {}
  }) {
    el._sp = this;
    this.$el = el;

    /** @type {SpreaxEvent[]} */
    this.$events = [];
    this.$ctx = createContext({
      state,
      methods,
      getters,
      thisArg: this,
      onChange: this.$emit.bind(this)
    });
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
          target.textContent = template.render(this.$ctx);
        }, { immediate: true });
      }
    } else if (isElement(target)) {
      const selector = findSelector(target, this.$el);

      for (const {
        name, options, param, value
      } of getDirectives(target)) {
        try {
          execute(name, {
            element: target,
            instance: this,
            param,
            options,
            value
          });
        } catch ({ message }) {
          throw new Error(`Error from @${name}: ${message}\n found at: ${selector}`);
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
