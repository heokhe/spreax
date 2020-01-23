import { ParseResult } from './parser';
import { Variables, Variable } from '../variables';

export function evaluate<T>(parseResult: ParseResult, context: Variables<T>) {
  if (parseResult.type === 'literal')
    return parseResult.value;
  const { varName, path } = parseResult;
  let val = (context[varName] as Variable<any>)?.value;
  for (const { isLiteral, name } of path) {
    val = val?.[isLiteral ? name : context[name]?.value]
  }
  return val;
}
