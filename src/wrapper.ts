import { Subscriber } from "./subscriber";
import { TextNodeWrapper } from "./text-node-wrapper";

export class Wrapper<T, E extends Element = Element> extends Subscriber<T> {
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
      [leftHand, arrayName] = string?.split(/ (?:in|of) /) ?? [],
      [variableName, indexName = 'i'] = leftHand?.split(', ') ?? [];
    return string ? { variableName, arrayName, indexName } : undefined;
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

  get $if() {
    return this.el.getAttribute('@if');
  }

  get directives() {
    const { $for, bind, boundAttributes, eventListeners, $if } = this;
    return { $for, bind, boundAttributes, eventListeners, $if }
  }
}
