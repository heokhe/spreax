import { Subscriber } from "./subscriber";
import { TEXT_NODE } from "./dom";
import { TextNodeWrapper } from "./text-node-wrapper";

export class ElementWrapper<T, E extends Element = Element> extends Subscriber<T> {
  el: E;
  constructor(element: E) {
    super();
    this.el = element;
  }
  nodes() {
    return [
      ...this.el.childNodes
    ].filter(node => node.nodeType === TEXT_NODE)
      .map(node => new TextNodeWrapper<T>(node))
      .filter(node => node.dependencies.length > 0)
  }
}
