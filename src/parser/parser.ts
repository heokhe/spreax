import { parseLiteralExpression, Literal } from "./literals";
import { isValidIdentifier } from "./identifiers";
import { memoize } from '../helpers';

export type ParseResultType = 'literal' | 'variable';
export type PathSection = { name: string; isLiteral: boolean }
export type ParseResult = {
  type: ParseResultType;
  dependencies: string[];
  value?: Literal;
  varName?: string;
  path?: PathSection[];
}

function parseUnmemoized(expr: string): ParseResult {
  const literalResult = parseLiteralExpression(expr);
  if (literalResult.length) {
    return {
      type: 'literal',
      value: literalResult[0],
      dependencies: []
    }
  }


  const [varName, ...accessors] = expr
    // replace .x with ["x"]
    .replace(/\.([^.[]+)/g, "[\"$1\"]")
    // split the keys
    .split(/(\[[^\][]+\])/g)
    // remove empty strings
    .filter(Boolean),
  pathSections: PathSection[] = accessors.map(ac => ac.slice(1, -1)).map(ac => {
    const isLiteral = ac.startsWith('"') && ac.endsWith('"');
    return { isLiteral, name: isLiteral ? ac.slice(1, -1) : ac }
  }),
  dependencies = [varName, ...pathSections.filter(s => !s.isLiteral).map(s => s.name)];

  for (const dep of dependencies)
    if (!isValidIdentifier(dep))
      throw new Error(`${dep} is not a valid identifier`)

  return {
    type: 'variable',
    path: pathSections,
    varName,
    dependencies
  }
}

export const parse = memoize(parseUnmemoized);
