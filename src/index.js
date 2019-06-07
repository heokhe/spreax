import {
  getDirectives, getAllNodes, isText, isElement
} from './dom';
import createTemplate from './template';
import { execute } from './directives';
import './directives/builtins';
import observe from './observer';
import Context, { createAlias } from './context';
import findSelector from './findSelector';

export { Directive, register } from './directives';

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

    const context = new Context({
      state,
      getters,
      methods,
      thisArg: this
    });
    this.$ctx = context;
    for (const key of context.$keys) createAlias(key, context, this);

    this.$formatters = formatters;

    getAllNodes(el).forEach(n => this.$handleNode(n));
    observe(el, this.$handleNode.bind(this));
  }

  /** @param {Node|Element} target */
  $handleNode(target) {
    const ctx = this.$ctx;

    if (isText(target)) {
      const text = target.textContent;
      if (/^\s*$/.test(text)) return;

      const template = createTemplate(text, this.$formatters);
      for (const v of template.vars) {
        ctx.$on(v, () => {
          target.textContent = template.render(ctx);
        }, true);
      }
    } else if (isElement(target)) {
      const selector = findSelector(target, this.$el);

      for (const di of getDirectives(target)) {
        const { name } = di;
        try {
          execute(name, {
            element: target,
            instance: this,
            param: di.param,
            options: di.options,
            value: di.value,
            context: ctx
          });
        } catch ({ message }) {
          throw new Error(`[@${name}] ${message}\n  found at: ${selector}`);
        }
      }
    }
  }
}
