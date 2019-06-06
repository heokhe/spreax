import { DIRECTIVE_REGEX } from './directives';

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

export const stringifyDirective = ({ name, param, options }) => `@${name}${param ? `:${param}` : ''}${Object.keys(options).map(k => `.${k}`).join()}`;

/** @param {Element} el */
export const getDirectives = el => Array.from(el.attributes)
  .filter(({ name }) => DIRECTIVE_REGEX.test(name))
  .map(({ name: rawName, value }) => {
    const [, name, param, optionsString = ''] = DIRECTIVE_REGEX.exec(rawName),
      options = Object.assign(...optionsString
        .slice(1)
        .split('.')
        .map(k => ({ [k]: true }))),
      attributeName = stringifyDirective({ name, param, options });

    return {
      param,
      value,
      options,
      name,
      attributeName
    };
  });
