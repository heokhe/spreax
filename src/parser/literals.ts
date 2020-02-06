export type LiteralValue = string | number | boolean | undefined;
export type LiteralResult = { ok: boolean; value?: LiteralValue };

const LITERALS = {
  true: true,
  false: false,
  null: null,
  NaN,
  undefined
};

/**
 * @returns An array with containing a value.
 * If it's empty, the function has failed to parse.
 */
export function parseLiteralExpression(expr: string): [LiteralValue] | [] {
  if (expr in LITERALS)
    return [LITERALS[expr]];
  const parsedToFloat = parseFloat(expr);
  if (!Number.isNaN(parsedToFloat))
    return [parsedToFloat];
  if (/^(['"]).*\1$/.test(expr))
    return [expr.slice(1, -1)];
  return [];
}
