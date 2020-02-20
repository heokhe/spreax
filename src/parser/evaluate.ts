import {
  ParseResult, PathSection, parse, ParseResultType
} from './parser';
import { Variables } from '../core/variables';
import { ActionFn } from '../core/actions';
import { applyOperators } from './unary-operators';

/* eslint-disable no-use-before-define, @typescript-eslint/no-use-before-define */
function evaluateWithoutOperators<T>(
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
        args = parseResult.arguments.map(a => evaluate(a, context));
      return preserveFunctions
        ? { fn, args }
        : fn(undefined, ...args); // the first argument is an Event object
    }
    default:
      return parseResult.value;
  }
}

export function evaluate<T>(
  parseResult: ParseResult, context: Variables<T>, preserveFunctions = false
) {
  return applyOperators(
    evaluateWithoutOperators(parseResult, context, preserveFunctions),
    parseResult.unaryOperators ?? []
  );
}


export function pathSectionsToString<T>(path: PathSection[], context: Variables<T>) {
  return path
    .map(section => (section.isLiteral ? `"${section.name}"` : section.name))
    .map(section => evaluate(parse(section), context));
}
