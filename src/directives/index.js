import { parseExpression } from '../parser';

export const DIRECTIVE_REGEX = /^\[([a-z]+)(?::([a-z]+))?\]$/i;

/** @param {Element} el */
export const getDirectives = el => Array.from(el.attributes)
  .filter(({ name }) => DIRECTIVE_REGEX.test(name))
  .map(({ name, value }) => {
    const [, dname, param] = DIRECTIVE_REGEX.exec(name);
    return { param, value, name: dname };
  });

/** @type {Object<string, Directive>} */
export const DIRECTIVES = {};

/**
 * @typedef {Object} DirectiveCallbackPayload
 * @property {Element} element
 * @property {string} [param]
 * @property {string} [rawValue]
 * @property {import("../parser/index").ParsedExpression} [value]
 */

export class Directive {
  /**
   * @param {string} name
   * @param {(this: import("..").default, payload: DirectiveCallbackPayload) => void} callback
   * @param {boolean} [paramRequired]
   */
  constructor(name, callback, paramRequired = false) {
    this.name = name;
    this.fn = callback;
    this.paramRequired = paramRequired;
  }

  /**
   * @param {import("..").default} instance
   * @param {Element} el
   * @param {string} param
   * @param {string} value
   */
  execute(instance, el, param, value) {
    if (this.paramRequired && !param) {
      throw new Error(`parameter is required for ${this.name} directive`);
    }
    this.fn.call(instance, {
      element: el,
      param,
      rawValue: value,
      value: value ? parseExpression(value) : undefined
    });
  }
}

/** @param {Directive} directive */
export function register(directive) {
  const { name } = directive;

  if (name in DIRECTIVES) throw new Error(`already registered ${name}`);
  if (!/^[a-z]+$/i.test(name)) throw new Error(`${name} is not a valid directive name`);

  DIRECTIVES[name] = directive;
}
