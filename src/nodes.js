export const { ELEMENT_NODE, TEXT_NODE } = Node;

/**
 * @param {Element} el
 * @returns {Node[]}
 */
export function getAllNodes(el) {
  return Array.from(el.childNodes)
    .filter(node => [ELEMENT_NODE, TEXT_NODE].includes(node.nodeType))
    .map(node => [node, ...getAllNodes(node)]).flat(Infinity);
}
