import { joinTwo, getDeep } from './utils';

/**
 * @param {string[]} names
 * @param {Object<string, import(".").Formatter} source
 */
export function makeFormatterFunction(names, source) {
  return names.map(n => source[n]).reduce((a, b) => c => b(a(c)), _ => _);
}

/**
 * @param {string} text
 * @param {Object<string, import(".").Formatter} fmtSource
 */
export default function createTemplate(text, fmtSource) {
  const reg = /\[\[ (?:\w+\.)*\w+(?: \| [a-z]+)* \]\]/gi,
    matches = (text.match(reg) || []).map(e => e.slice(3, -3)).map(match => {
      const [variable, ...formatters] = match.split(' | ');
      return { variable, formatters };
    }),
    others = text.split(reg);

  return {
    vars: matches.map(({ variable }) => variable),
    render: ctx => {
      return joinTwo(others, matches.map(({ formatters, variable }) => {
        const format = makeFormatterFunction(formatters, fmtSource),
          value = getDeep(ctx, variable.split('.'));

        return format(value.toString());
      }));
    }
  };
}
