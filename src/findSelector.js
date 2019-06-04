/**
 * @param {Element} el
 * @param {Element} root
 * @return {Element[]}
 */
const getPath = (el, root) => {
  const parent = el.parentElement;
  if (!parent) return []; // sometimes parent === null happens
  return [
    ...el === root ? [] : getPath(el.parentElement, root),
    el
  ];
};

/**
 * Generates a selector string for the given element.
 * @param {Element} element
 * @param {Element} root
 */
export default function findSelector(element, root) {
  return getPath(element, root).map(el => {
    let string = el.tagName.toLowerCase();
    if (el.id) string += `#${el.id}`;
    for (const c of el.classList) string += `.${c}`;

    if (/^div[.#]/.test(string)) string = string.slice(3);

    return string;
  }).join(' > ');
}
