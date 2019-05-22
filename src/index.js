import { getAllNodes } from './nodes';
import { extract } from './template';
import { getDirectives, DIRECTIVES } from './directives';
import proxy from './proxy';
import './directives/builtins';

export default class Spreax {
  /**
   * @typedef {Object} ConstructorOptions
   * @property {Element} el
   * @property {Object} state
   * @property {Object<string, () => void>} methods
   * @param {ConstructorOptions} options
   */
  constructor({ el, state, methods }) {
    el._sp = this;
    this.$el = el;

    /**
     * @typedef {{ key: string, fn: (this: Spreax) => void }} SpreaxEvent
     * @type {SpreaxEvent[]}
     */
    this.$events = [];

    this.$state = proxy(state, (path) => {
      this.$emit('*');
      this.$emit(path.join('.'));
    });

    for (const key of Object.keys(this.$state)) {
      Object.defineProperty(this, key, {
        get: () => this.$state[key],
        set: v => { this.$state[key] = v; },
      });
    }
    for (const key of Object.keys(methods)) {
      this[key] = methods[key].bind(this);
    }

    getAllNodes(el).forEach(n => this.$handleNode(n));
  }

  /** @param {Node|Element} target */
  $handleNode(target) {
    if (target.nodeName === '#text') {
      const text = target.textContent;
      if (/^\s*$/.test(text)) return;

      const template = extract(text);
      for (const v of template.vars) {
        this.$on(v, () => {
          target.textContent = template.render(this.$state);
        }, { immediate: true });
      }
    } else {
      for (const { value, name, param } of getDirectives(target)) {
        if (name in DIRECTIVES) {
          DIRECTIVES[name].execute(this, target, param, value);
        }
      }
    }
  }

  $on(key, callback, { immediate = false } = {}) {
    const id = this.$events.push({ key, fn: callback.bind(this) }) - 1;
    if (immediate) this.$emit(id);
  }

  $emit(keyOrId) {
    const events = this.$events;
    events.filter((ev, i) => {
      if (keyOrId === '*') return true;
      return (typeof keyOrId === 'number' ? i : ev.key) === keyOrId;
    }).forEach((event) => {
      event.fn();
    });
  }
}
