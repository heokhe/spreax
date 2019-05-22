import { getDeep, setDeep } from '../utils';
import parseLiteral from './literals';

/**
 * @typedef {'property'|'action'|'literal'} ExpressionType
 * @typedef {Object} ParsedExpression
 * @property {ExpressionType} type
 * @property {(ctx: any) => any} fn
 * @property {boolean} [isMethod]
 * @property {string[]} [path]
 * @property {string} [property]
 * @property {ParsedExpression} [rightHand]
 */

/**
 * @param {string} expr
 * @returns {ParsedExpression}
 */
export function parseExpression(expr) {
  expr = expr.trim();

  if (expr[0] === '!') {
    const parsed = parseExpression(expr.slice(1));
    if (parsed.type === 'action' && !parsed.isMethod) return null;
    return {
      type: 'literal',
      fn: ctx => !parsed.fn(ctx)
    };
  }

  const lit = parseLiteral(expr);
  if (lit.done) {
    return {
      type: 'literal',
      fn: () => lit.value
    };
  }

  const [property] = expr.match(/^(?:[a-z_]+\.)*[a-z_]+$/i) || []; // TODO
  if (property) {
    const path = property.split('.');
    return {
      type: 'property',
      property,
      path,
      fn: ctx => getDeep(ctx, path)
    };
  }

  const [, method] = expr.match(/^([a-z_]\w+)\(\)$/i) || [];
  if (method) {
    return {
      type: 'action',
      isMethod: true,
      fn: ctx => ctx[method]()
    };
  }

  const stmt = expr.match(/^(.+) ?= ?(.+)$/) || [];
  if (stmt.length) {
    const [leftHand, rightHand] = stmt.slice(1).map(e => parseExpression(e.trim()));

    if (
      leftHand.type !== 'property' || (
        rightHand.type === 'action' && !rightHand.isMethod
      )
    ) throw new Error('da fuck');

    return {
      type: 'action',
      isMethod: false,
      rightHand,
      fn: (ctx) => {
        setDeep(ctx, leftHand.path, rightHand.fn(ctx));
      }
    };
  }

  throw new Error(`unexpected expression "${expr}"`);
}
