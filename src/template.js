import { joinTwo, getDeep } from './utils';

/** @param {string} text */
export function extract(text) {
  const reg = /\[\[ (?:\w+\.)*\w+ \]\]/g;

  const vars = (text.match(reg) || []).map(v => v.slice(3, -3));


  const others = text.split(reg);

  return {
    vars,
    render: ctx => joinTwo(others, vars.map(e => getDeep(ctx, e.split('.')))),
  };
}
