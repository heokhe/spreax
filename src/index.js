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
 * @typedef {{ key: string, fn: (this: Spreax) => void, node?: Node, enabled: boolean }} SpreaxEvent
 * @typedef {Object} ConstructorOptions
 * @property {Element} el
 * @property {Object} state
 * @property {Object<string, () => void>} [methods]
 * @property {Object<string, (state: Object) => any} [getters]
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

    this.$state = proxy(state, path => {
      this.$emit('*');
      this.$emit(path.join('.'));
    });
    for (const key of Object.keys(this.$state)) {
      Object.defineProperty(this, key, {
        get: () => this.$state[key],
        set: v => { this.$state[key] = v; }
      });
    }
    for (const key of Object.keys(methods)) this[key] = methods[key].bind(this);
    for (const [name, fn] of Object.entries(getters)) {
      Object.defineProperty(this, name, {
        get: () => fn(this.$state),
        set: () => false
      });
    }
    this.$formatters = formatters;

    getAllNodes(el).forEach(n => this.$handleNode(n));

    observe(el, (node, isRemoved) => {
      const relatedEvents = this.$events.map((ev, i) => (node === ev.node ? i : null))
        .filter(i => i !== null);

      if (relatedEvents.length) {
        for (const i of relatedEvents) this.$events[i].enabled = !isRemoved;
      } else if (!isRemoved) this.$handleNode(node);
    });
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
        }, { immediate: true, node: target });
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

  $on(key, callback, { immediate = false, node } = {}) {
    const id = this.$events.push({
      key,
      fn: callback.bind(this),
      node,
      enabled: true
    }) - 1;
    if (immediate) this.$emit(id);
  }

  $emit(keyOrId) {
    const events = this.$events;
    events.filter((ev, i) => {
      if (!ev.enabled) return false;
      if (keyOrId === '*') return true;
      return (typeof keyOrId === 'number' ? i : ev.key) === keyOrId;
    }).forEach(event => {
      event.fn();
    });
  }
}

export { Directive, register } from './directives';
export default Spreax;
