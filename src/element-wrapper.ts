import { Subscriber } from "./subscriber";
import { TextNodeWrapper } from "./text-node-wrapper";

export class ElementWrapper<T, E extends Element = Element> extends Subscriber<T> {
  el: E;
  nodes: TextNodeWrapper<T>[];
  attrs: Attr[];
  constructor(element: E) {
    super();
    this.el = element;
    this.nodes = this.getNodes();
    this.attrs = [...element.attributes]
  }

  getNodes() {
    return [...this.el.childNodes]
      .filter(node => node.nodeType === Node.TEXT_NODE)
      .map(node => new TextNodeWrapper<T>(node))
      .filter(node => node.dependencies.length > 0)
  }

  destroy() {
    this.el.remove();
  }

  get $for() {
    const string = this.el.getAttribute('@for'),
      [variableName, arrayName] = string?.split(/ (?:in|of) /) ?? [];
    return string ? { variableName, arrayName } : undefined;
  }

  get boundAttributes() {
    return this.attrs
      .filter(attr => attr.name.startsWith('$'))
      .map(attr => ({ name: attr.name.slice(1), value: attr.value }))
  }

  get eventListeners() {
    return this.attrs
      .filter(attr => attr.name.startsWith('@on:'))
      .map(attr => ({ eventName: attr.name.slice(4), actionName: attr.value }));
  }

  get bind() {
    return this.el.getAttribute('@bind')
  }

  get directives() {
    const { $for, bind, boundAttributes, eventListeners } = this;
    return { $for, bind, boundAttributes, eventListeners }
  }
}
