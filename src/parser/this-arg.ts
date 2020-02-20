import { ParseResult, ParseResultType } from './parser';

/**
 * Returns the `thisArg` of the given function.
 */
export function getThisArg(parseResult: ParseResult): ParseResult {
  const { path, varName } = parseResult;
  return {
    ...parseResult,
    type: ParseResultType.Variable,
    varName,
    path: path.slice(0, -1)
  };
}
