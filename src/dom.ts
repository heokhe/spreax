import { DIRECTIVE_REGEX } from './directives';
import { getDuplicateIndexes } from './utils';

export const { ELEMENT_NODE, TEXT_NODE } = Node;
export const isTextNode = (n: Node) => n.nodeType === TEXT_NODE;
export const isElement = (n: Node): n is Element => n.nodeType === ELEMENT_NODE;
export type ElementOrNode = Element | Node;

export function getAllTextNodes(root: Element): Node[] {
  const nodes = [];
  for (const childNode of root.childNodes)
    if (isTextNode(childNode))
      nodes.push(childNode);
  return nodes;
}

export function getAllElements(root: Element): Element[] {
  const elements = [];
  for (const child of root.children)
    elements.push(child, ...getAllElements(child));
  return elements;
}

export function getDirectives(element: Element) {
  return [...element.attributes]
    .filter(({ name }) => name.startsWith('@'))
    .map(({ name: fullName, value }) => {
      const [name, param] = fullName.slice(1).split(':', 2);
      return { name, param, value }
    });
}
