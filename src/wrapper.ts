import { Subscriber } from "./core/subscriber";
import { TextNodeWrapper } from "./text-node-wrapper";
import { IfHandler } from './directives/if';
import { AttrHandler } from './directives/attr';
import { BindHandler } from './directives/bind';

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

  get directives() {
    return [
      new IfHandler<T>(),
      new AttrHandler<T>(),
      new BindHandler<T>()
    ]
  }
}
