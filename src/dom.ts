export function createElementTree(root: HTMLElement) {
  const elements = [root];
  for (const child of root.children)
    elements.push(...createElementTree(child as HTMLElement));
  return elements;
}

export function elementExistsInDOM(el: HTMLElement) {
  return document.contains(el);
}
