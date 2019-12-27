import { findContext, Context } from "./context";
import { isElement } from "./dom";

export function each<T>(el: Element, prop: string, variableName: string): void {
  const array: T[] = findContext(el).get(prop);
  const child = el.firstElementChild;
  for (let i = 0; i < array.length; i++) {
    const item = array[i];
    const newChild = child.cloneNode(true);
    if (isElement(newChild)) {
      el.appendChild(newChild);
      this.setupElement(newChild, new Context({
        state: {}, methods: {},
        parent: findContext(newChild),
        computed: {
          i: () => i,
          [variableName]: () => item
        }
      }));
    }
  }
  el.removeChild(child);
}