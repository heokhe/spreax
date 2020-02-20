import { parseLiteralExpression, LiteralValue } from './literals';
import { isValidIdentifier } from './identifiers';
import { memoize, flatUnique } from '../helpers';
import { UnaryOperator, UNARY_OPERATORS } from './unary-operators';
import { parseFunctions } from './parse-functions';
import { getThisArg } from './this-arg';

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
  arguments?: ParseResult[];
  thisArg?: ParseResult;
  unaryOperators?: UnaryOperator[];
}

/* eslint-disable @typescript-eslint/no-use-before-define, no-use-before-define */
function parseUnmemoized(expr: string): ParseResult {
  expr = expr.trim();
  if (!expr) return undefined;

  if (UNARY_OPERATORS.includes(expr[0])) {
    const [op] = expr,
      parsed = parse(expr.slice(1));
    return {
      ...parsed,
      unaryOperators: [...parsed.unaryOperators ?? [], op as UnaryOperator]
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

  const { functionName, parameters } = parseFunctions(expr) || {};
  if (parameters) {
    const parsedFunctionExpression = parse(functionName);
    const parsedParameters = parameters.map(parse);
    const dependencies = flatUnique([
      parsedFunctionExpression.dependencies,
      ...parsedParameters.map(p => p.dependencies)
    ]);
    return {
      ...parsedFunctionExpression,
      type: ParseResultType.FunctionExpression,
      dependencies,
      arguments: parsedParameters,
      thisArg: getThisArg(parsedFunctionExpression)
    };
  }

  const [varName, ...accessors] = expr
    // [0] -> ["0"]
      .replace(/\[(\d+)\]/g, '["$1"]')
    // ['key'] -> ["key"]
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
    type: ParseResultType.Variable,
    path: pathSections,
    varName,
    dependencies
  };
}

export const parse = memoize(parseUnmemoized);
