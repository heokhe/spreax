import {
  ParseResult, PathSection, parse, ParseResultType
} from './parser';
import { Variables, Variable } from '../core/variables';
import { ActionFn } from '../core/actions';

export function evaluate<T>(parseResult: ParseResult, context: Variables<T>) {
  if (!parseResult)
    return undefined;

  if (parseResult.type === ParseResultType.Literal)
    return parseResult.value;

  if (parseResult.type === ParseResultType.FunctionExpression) {
    const fn: ActionFn = evaluate({
      ...parseResult,
      type: ParseResultType.Variable
    }, context),
      arg = parseResult.argument
        ? evaluate(parseResult.argument, context)
        : undefined;
    return { fn, arg };
  }

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
