export const isComponent = (element: Element) =>
  element.tagName.includes('-');

export function createElementTree(root: HTMLElement, componentsOnly = false) {
  const elements = (!componentsOnly || isComponent(root)) ? [root] : [];
  for (const child of root.children)
    elements.push(...createElementTree(child as HTMLElement, componentsOnly));
  return elements;
}

export function elementExistsInDOM(el: HTMLElement) {
  return el.ownerDocument.contains(el);
}

declare global {
  interface Element {
    _$secretAttrs_: {
      [x: string]: any;
    };
  }
}


export function getSecretAttribute(element: HTMLElement, attrName: string) {
  return element._$secretAttrs_?.[attrName];
}

export function setSecretAttribute(element: HTMLElement, attrName: string, value: any) {
  if (!element._$secretAttrs_)
    element._$secretAttrs_ = {};
  element._$secretAttrs_[attrName] = value;
}

export function hasSecretAttribute(element: HTMLElement, attrName: string) {
  return attrName in (element._$secretAttrs_ ?? {});
}
