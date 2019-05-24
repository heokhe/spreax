import { getDeep, setDeep } from '../utils';
import parseLiteral from './literals';

/**
 * @typedef {'property'|'action'|'literal'|'statement'} ExpressionType
 * @typedef {Object} ParsedExpression
 * @property {ExpressionType} type
 * @property {(ctx: any) => any} fn
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
    if (parsed.type === 'statement') return null;

    return {
      type: 'literal',
      fn: ctx => {
        const val = parsed.fn(ctx);
        switch (prefix) {
          case '!': return !val;
          case '-': return -val;
          default: return null;
        }
      }
    };
  }

  const lit = parseLiteral(expr);
  if (lit.done) {
    return {
      type: 'literal',
      fn: () => lit.value
    };
  }

  const [property] = expr.match(/^(?:[a-z_]\w*\.)*\w+$/i) || [];
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
      fn: ctx => ctx[method]()
    };
  }

  const twoHands = expr.match(/^([^ ]+) *([-+]|[=!]?)?= *([^ ]+)$/) || [];
  if (twoHands.length) {
    const [, rawLeft, operator, rawRight] = twoHands,
      [leftHand, rightHand] = [rawLeft, rawRight].map(h => parseExpression(h.trim()));

    if (operator === '!' || operator === '=') { // comparing
      if (leftHand.type === 'statement' || rightHand.type === 'statement') throw new Error();
      return {
        ...leftHand,
        fn: ctx => {
          const [lv, rv] = [leftHand, rightHand].map(({ fn }) => fn(ctx));
          return operator === '=' ? lv === rv : lv !== rv;
        }
      };
    }
    if (leftHand.type !== 'property' || rightHand.type === 'statement') throw new Error();
    return { // assigning values
      type: 'statement',
      rightHand,
      fn: ctx => {
        const value = rightHand.fn(ctx),
          prevValue = leftHand.fn(ctx);

        switch (operator) {
          case '+':
            return setDeep(ctx, leftHand.path, prevValue + value);
          case '-':
            return setDeep(ctx, leftHand.path, prevValue - value);
          default:
            return setDeep(ctx, leftHand.path, prevValue);
        }
      }
    };
  }
  throw new Error(`unexpected expression "${expr}"`);
}
