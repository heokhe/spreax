import { DIRECTIVE_REGEX } from './directives';
import { getDuplicateIndexes } from './utils';

export const { ELEMENT_NODE, TEXT_NODE } = Node;
export const isTextNode = (n: Node) => n.nodeType === TEXT_NODE;
export const isElement = (n: Node): n is Element => n.nodeType === ELEMENT_NODE;
export type ElementOrNode = Element | Node;

export function getAllNodes(root: Node): ElementOrNode[] {
  const array = [];
  for (const childNode of root.childNodes)
    if (isTextNode(childNode) || isElement(childNode))
      array.push(childNode, ...getAllNodes(childNode));
  return array;
};

export function getAllElements(root: Element): Element[] {
  const array = [];
  for (const child of root.children)
    array.push(child, ...getAllElements(child));
  return array;
}

export function getDirectives(element: Element) {
  const directives = isElement(element) ?
    [...element.attributes]
      .filter(({ name }) => name.startsWith('@'))
      .map(({ name, value }) => ({
        name: name.slice(1),
        value
      }))
    : [];
  return directives
}

// export const stringifyDirective = (name, param, options = {}) => {
//   let str = `@${name}`;
//   if (param) str += `:${param}`;
//   for (const key in options) str += `.${key}`;
//   return str;
// };

// /** @param {Element} el */
// export function getDirectives(el) {
//   const drctvs = Array.from(el.attributes)
//       .filter(({ name }) => DIRECTIVE_REGEX.test(name))
//       .map(({ name: rawName, value }) => {
//         const [, name, param = '', optionsString = ''] = DIRECTIVE_REGEX.exec(rawName),
//           options = Object.assign(
//             ...optionsString.slice(1).split('.').map(k => ({ [k]: true }))
//           ),
//           attributeName = stringifyDirective(name, param, options);

//         return {
//           param,
//           value,
//           options,
//           name,
//           attributeName
//         };
//       }),
//     strings = drctvs.map(({ name, param }) => stringifyDirective(name, param)),
//     dups = getDuplicateIndexes(strings);

//   return drctvs.map((d, i) => {
//     if (dups.includes(i)) {
//       // eslint-disable-next-line no-console
//       console.warn(`found a duplicate directive "${d.attributeName}"`);
//       return null;
//     }
//     return d;
//   }).filter(Boolean);
// }
