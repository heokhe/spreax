export function createElementTree(root: HTMLElement) {
  const elements = [root];
  for (const child of root.children)
    elements.push(...createElementTree(child));
  return elements;
}

export function elementExistsInDOM(el: HTMLElement) {
  return document.contains(el);
}
