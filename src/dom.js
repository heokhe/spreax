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

/** @param {Element} el */
export const getDirectives = el => Array.from(el.attributes)
  .filter(({ name }) => DIRECTIVE_REGEX.test(name))
  .map(({ name, value }) => {
    const [, dname, param, options = ''] = DIRECTIVE_REGEX.exec(name);
    return {
      param,
      value,
      name: dname,
      options: Object.assign(...options.slice(1).split('.').map(k => ({ [k]: true })))
    };
  });
