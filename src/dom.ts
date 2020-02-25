export function createElementTree(root: HTMLElement, components = false) {
  const elements = (!components || root.tagName.includes('-')) ? [root] : [];
  for (const child of root.children)
    elements.push(...createElementTree(child as HTMLElement, components));
  return elements;
}

export function elementExistsInDOM(el: HTMLElement) {
  return el.ownerDocument.contains(el);
}
