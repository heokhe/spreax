import { parseLiteralExpression, LiteralValue } from './literals';
import { isValidIdentifier } from './identifiers';
import { memoize } from '../helpers';

export const enum ParseResultType {
  Literal,
  Variable,
  FunctionExpression
}
export type PathSection = { name: string; isLiteral: boolean }
export type ParseResult = {
  type: ParseResultType;
  dependencies: string[];
  value?: LiteralValue;
  varName?: string;
  path?: PathSection[];
  argument?: ParseResult;
}

/* eslint-disable @typescript-eslint/no-use-before-define, no-use-before-define */
function parseUnmemoized(expr: string): ParseResult {
  expr = expr.trim();
  if (!expr) return undefined;

  const [, functionExpr, argList] = expr.match(/^([^(]+)(\(.*\))$/) || [];
  if (functionExpr) {
    const argValue = argList.slice(1, -1);
    const parsedArg = argValue ? parse(argValue) : undefined;
    const parsedFn = parse(functionExpr);
    const dependencies = [
      ...parsedFn.dependencies,
      ...(parsedArg?.dependencies ?? [])
    ];
    return {
      ...parsedFn,
      argument: parsedArg,
      dependencies,
      type: ParseResultType.FunctionExpression
    };
  }

  const literalResult = parseLiteralExpression(expr);
  if (literalResult.length) {
    return {
      type: ParseResultType.Literal,
      value: literalResult[0],
      dependencies: []
    };
  }

  const [varName, ...accessors] = expr
      .replace(/'/g, '"')
    // replace .x with ["x"]
      .replace(/\.([^.[]+)/g, '["$1"]')
    // split the keys
      .split(/(\[[^\][]+\])/g)
    // remove empty strings
      .filter(Boolean),
    pathSections: PathSection[] = accessors.map(ac => ac.slice(1, -1)).map(ac => {
      const isLiteral = ac.startsWith('"') && ac.endsWith('"');
      return { isLiteral, name: isLiteral ? ac.slice(1, -1) : ac };
    }),
    dependencies = [varName, ...pathSections.filter(s => !s.isLiteral).map(s => s.name)];

  for (const dep of dependencies)
    if (!isValidIdentifier(dep))
      throw new Error(`${dep} is not a valid identifier`);

  return {
    type: ParseResultType.Literal,
    path: pathSections,
    varName,
    dependencies
  };
}

export const parse = memoize(parseUnmemoized);
