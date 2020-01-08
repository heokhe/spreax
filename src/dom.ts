export function makeElementTree(root: Element): Element[] {
  const elements = [root];
  for (const child of root.children)
    elements.push(...makeElementTree(child));
  return elements;
}
