import { parseExpression } from '../parser';

export const DIRECTIVE_REGEX = /^@([a-z]+)(?::((?:[a-z]+-)*[a-z]+))?(\.[a-z]+)*$/i;

/** @type {Object<string, Directive>} */
export const DIRECTIVES = {};

/** @param {Directive} directive */
export function register(directive) {
  const { name } = directive;

  if (name in DIRECTIVES) throw new Error(`already registered ${name}`);
  if (!/^[a-z]+$/i.test(name)) throw new Error(`${name} is not a valid directive name`);

  DIRECTIVES[name] = directive;
}

/**
 * @typedef {Object<string, boolean>} DirectiveOptions
 * @typedef {Object} DirectiveCallbackPayload
 * @property {Element} element
 * @property {DirectiveOptions} options
 * @property {import("../context").default} context
 * @property {string} [param]
 * @property {string} [rawValue]
 * @property {import("../parser/").ParsedExpression} [data]
 */
export class Directive {
  /**
   * @param {string} name
   * @param {(this: import("..").Spreax, payload: DirectiveCallbackPayload) => void} callback
   * @param {{
      paramRequired?: boolean,
      allow?: import('../parser').ExpressionType[]
      disallow?: import('../parser').ExpressionType[]
    }} [options]
   */
  constructor(name, callback, {
    paramRequired = false,
    allow, disallow
  } = {}) {
    this.name = name;
    this.fn = callback;
    this.paramRequired = paramRequired;
    this.types = { allow, disallow };
  }

  isValidType(t) {
    const { allow, disallow } = this.types;

    let b = !allow || allow.includes(t);
    if (b && disallow && disallow.includes(t)) b = false;
    return b;
  }
}


/** @param {string} name */
export function execute(name, {
  element, value, param, options, instance, context
}) {
  if (name in DIRECTIVES) {
    const { [name]: di } = DIRECTIVES,
      parsedData = parseExpression(value),
      { type: dataType } = parsedData;

    if (di.paramRequired && !param) throw new Error('this directive requires a parameter');
    if (di.isValidType(dataType)) {
      throw new Error(`${dataType} type is not allowed`);
    }

    di.fn.call(instance, {
      data: parsedData,
      rawValue: value,
      element,
      options,
      param,
      context
    });
  } else throw new Error('directive not found!');
}
