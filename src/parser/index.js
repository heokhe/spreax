import { getDeep, setDeep } from '../utils';
import parseLiteral from './literals';

/**
 * @typedef {'property'|'action'|'value'|'statement'|'loop'} ExpressionType
 * @typedef {Object} ParsedExpression
 * @property {ExpressionType} type
 * @property {(ctx: any) => any} fn
 * @property {string[]} [path]
 * @property {string} [property]
 * @property {boolean} [isPropertyName]
 * @property {ParsedExpression} [rightHand]
 * @property {string} [item]
 */

/**
 * @param {string} expr
 * @returns {ParsedExpression}
 */
export function parseExpression(expr) {
  expr = expr.trim();

  if (expr[0] === '!') {
    const parsed = parseExpression(expr.slice(1)),
      { type } = parsed;

    if (type === 'statement') return null;
    return {
      ...parsed,
      ...parsed.type === 'property' ? { isPropertyName: false } : { type: 'value' },
      fn: c => !parsed.fn(c)
    };
  }

  const loop = expr.match(/^(.+) of (.+)$/);
  if (loop) {
    const [, left, right] = loop,
      parsedLeft = parseExpression(left),
      parsedRight = parseExpression(right);

    if (parsedLeft.isPropertyName && parsedRight.type !== 'statement') {
      return {
        type: 'loop',
        item: left,
        property: parsedRight.property,
        fn: parsedRight.fn
      };
    }
  }

  const lit = parseLiteral(expr);
  if (lit.done) {
    return {
      type: 'value',
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
      isPropertyName: true,
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

  const twoHands = expr.match(/^([^ ]+) *([-+]|[=!])?= *([^ ]+)$/) || [];
  if (twoHands.length) {
    const [, rawLeft, operator, rawRight] = twoHands,
      [leftHand, rightHand] = [rawLeft, rawRight].map(h => parseExpression(h.trim()));

    if (operator === '!' || operator === '=') { // comparing
      if (leftHand.type === 'statement' || rightHand.type === 'statement') throw new Error('cannot compare statements');

      return {
        ...leftHand,
        fn: ctx => {
          const [lv, rv] = [leftHand, rightHand].map(({ fn }) => fn(ctx));
          return operator === '=' ? lv === rv : lv !== rv;
        }
      };
    }
    // assigning values

    if (!leftHand.isPropertyName) throw new Error(`"${rawLeft}" is not a property name`);
    if (rightHand.type === 'statement') throw new Error(`${rawRight} is a statement, not an expression`);

    return {
      type: 'statement',
      rightHand,
      fn: ctx => {
        const rv = rightHand.fn(ctx),
          lv = leftHand.fn(ctx);
        let value;

        switch (operator) {
          case '+':
            value = lv + rv;
            break;
          case '-':
            value = lv - rv;
            break;
          default:
            value = lv;
        }

        return setDeep(ctx, leftHand.path, value);
      }
    };
  }
  throw new Error(`unexpected expression "${expr}"`);
}
