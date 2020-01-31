import { ParseResult, PathSection, parse } from './parser';
import { Variables, Variable } from '../core/variables';

export function evaluate<T>(parseResult: ParseResult, context: Variables<T>) {
  if (parseResult.type === 'literal')
    return parseResult.value;
  const { varName, path } = parseResult;
  let val = (context[varName] as Variable<any>)?.value;
  for (const { isLiteral, name } of path) {
    val = val?.[isLiteral ? name : context[name]?.value];
  }
  return val;
}

export function pathSectionsToString<T>(path: PathSection[], context: Variables<T>) {
  return path
    .map(section => (section.isLiteral ? `"${section.name}"` : section.name))
    .map(section => evaluate(parse(section), context));
}
