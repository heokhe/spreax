import {
  ParseResult, PathSection, parse, ParseResultType
} from './parser';
import { Variables } from '../core/variables';
import { ActionFn } from '../core/actions';

export function evaluate<T>(
  parseResult: ParseResult, context: Variables<T>, preserveFunctions = false
) {
  if (!parseResult)
    return undefined;
  switch (parseResult.type) {
    case ParseResultType.Variable: {
      const { varName, path } = parseResult;
      let val = context[varName]?.value;
      for (const { isLiteral, name } of path)
        val = val?.[isLiteral ? name : context[name]?.value];
      return val;
    }
    case ParseResultType.FunctionExpression: {
      const fn: ActionFn = evaluate({
        ...parseResult,
        type: ParseResultType.Variable
      }, context),
        arg = parseResult.argument
          ? evaluate(parseResult.argument, context)
          : undefined;
      return preserveFunctions ? { fn, arg } : fn(arg);
    }
    default:
      return parseResult.value;
  }
}

export function pathSectionsToString<T>(path: PathSection[], context: Variables<T>) {
  return path
    .map(section => (section.isLiteral ? `"${section.name}"` : section.name))
    .map(section => evaluate(parse(section), context));
}
