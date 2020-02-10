export function createElementTree(root: Element): Element[] {
  const elements = [root];
  for (const child of root.children)
    elements.push(...createElementTree(child));
  return elements;
}
