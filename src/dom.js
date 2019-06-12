import { DIRECTIVE_REGEX } from './directives';
import { getDuplicateIndexes } from './utils';

export const { ELEMENT_NODE, TEXT_NODE } = Node;
export const isText = node => node.nodeType === TEXT_NODE;
export const isElement = node => node.nodeType === ELEMENT_NODE;

/**
 * @param {Element} root
 * @returns {Node[]}
 */
export const getAllNodes = root => {
  const isPre = isElement(root) && root.hasAttribute('data-sp-pre');
  return Array.from(root.childNodes)
    .filter(node => [ELEMENT_NODE, ...!isPre ? [TEXT_NODE] : []].includes(node.nodeType))
    .map(node => [node, ...getAllNodes(node)]).flat(Infinity);
};

export const stringifyDirective = (name, param, options = {}) => {
  let str = `@${name}`;
  if (param) str += `:${param}`;
  for (const key in options) str += `.${key}`;
  return str;
};

/** @param {Element} el */
export function getDirectives(el) {
  const drctvs = Array.from(el.attributes)
      .filter(({ name }) => DIRECTIVE_REGEX.test(name))
      .map(({ name: rawName, value }) => {
        const [, name, param = '', optionsString = ''] = DIRECTIVE_REGEX.exec(rawName),
          options = Object.assign(
            ...optionsString.slice(1).split('.').map(k => ({ [k]: true }))
          ),
          attributeName = stringifyDirective(name, param, options);

        return {
          param,
          value,
          options,
          name,
          attributeName
        };
      }),
    strings = drctvs.map(({ name, param }) => stringifyDirective(name, param)),
    dups = getDuplicateIndexes(strings);

  return drctvs.map((d, i) => {
    if (dups.includes(i)) {
      // eslint-disable-next-line no-console
      console.warn(`found a duplicate directive "${d.attributeName}"`);
      return null;
    }
    return d;
  }).filter(Boolean);
}
