import { joinTwo, isObject } from './utils';
import { Context } from './context';

export const toString = x => (isObject(x, true) ? JSON.stringify(x) : String(x));

const TEMPLATE_REGEX = /@\( *(?:[a-z_]\w*\.)*\w+(?: \| [a-z]+)* *\)/gi;

export default function createTemplate(text: string) {
  const variables = (text.match(TEMPLATE_REGEX) || [])
    .map(e => e.slice(2, -1).trim()),
    others = text.split(TEMPLATE_REGEX);

  return {
    variables,
    render: (ctx: Context): string => {
      return joinTwo(others, variables.map(m => {
        return toString(toString(ctx.get(m)));
      }));
    }
  };
}
