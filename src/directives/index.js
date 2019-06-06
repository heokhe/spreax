import { parseExpression } from '../parser';

export const DIRECTIVE_REGEX = /^@([a-z]+)(?::((?:[a-z]+-)*[a-z]+))?(\.[a-z]+)*$/i;
/** @type {Object<string, Directive>} */
export const DIRECTIVES = {};

/**
 * @typedef {Object<string, boolean>} DirectiveOptions
 * @typedef {Object} DirectiveCallbackPayload
 * @property {Element} element
 * @property {DirectiveOptions} options
 * @property {object} context
 * @property {string} [param]
 * @property {string} [rawValue]
 * @property {import("../parser/index").ParsedExpression} [data]
 */

export class Directive {
  /**
   * @param {string} name
   * @param {(this: import("..").Spreax, payload: DirectiveCallbackPayload) => void} callback
   * @param {{ paramRequired?: boolean, allowStatements?: boolean }} [options]
   */
  constructor(name, callback, {
    paramRequired = false, allowStatements = false
  } = {}) {
    this.name = name;
    this.fn = callback;
    this.paramRequired = paramRequired;
    this.allowStatements = allowStatements;
  }
}

/** @param {Directive} directive */
export function register(directive) {
  const { name } = directive;

  if (name in DIRECTIVES) throw new Error(`already registered ${name}`);
  if (!/^[a-z]+$/i.test(name)) throw new Error(`${name} is not a valid directive name`);

  DIRECTIVES[name] = directive;
}

/** @param {string} name */
export function execute(name, {
  element, value, param, options, instance, context
}) {
  if (name in DIRECTIVES) {
    const { [name]: { allowStatements, paramRequired, fn } } = DIRECTIVES,
      parsedData = parseExpression(value);
    if (!allowStatements && parsedData.type === 'statement') {
      throw new Error(`@${name} doesn't accept statements`);
    }
    if (paramRequired && !param) {
      throw new Error(`a parameter is required for @${name}`);
    }

    fn.call(instance, {
      data: parsedData,
      rawValue: value,
      element,
      options,
      param,
      context
    });
  } else throw new Error(`@${name} not found!`);
}
