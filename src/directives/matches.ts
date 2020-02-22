import { ParseResult } from '../parser/parser';

export type DirectiveMatch = {
  value: string;
  parameter?: string;
  parsed: ParseResult;
}

export function extractDirectiveMatches({
  element, directiveName, parameters = false, parse
}: {
  element: HTMLElement;
  directiveName: string;
  parameters?: boolean;
  parse: (expr: string) => ParseResult;
}) {
  const output: DirectiveMatch[] = [];
  for (const { name, value } of element.attributes) {
    if (parameters
      ? name.startsWith(`@${directiveName}:`)
      : name === `@${directiveName}`) {
      const [, parameter] = name.split(':', 2);
      const finalValue = parameters ? (value || parameter) : value;
      output.push({
        parameter,
        value: finalValue,
        parsed: parse(finalValue)
      });
    }
  }
  return output;
}
