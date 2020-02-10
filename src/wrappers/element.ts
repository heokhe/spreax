import { Subscriber } from '../core/subscriber';
import { TextNodeWrapper } from './text-node';

export class Wrapper<T, E extends Element = Element> extends Subscriber<T> {
  el: E;

  nodes: TextNodeWrapper<T>[];

  attrs: Attr[];

  constructor(element: E) {
    super();
    this.el = element;
    this.nodes = this.getNodes();
    this.attrs = [...element.attributes];
  }

  private getNodes() {
    return [...this.el.childNodes]
      .filter(node => node.nodeType === Node.TEXT_NODE)
      .map(node => new TextNodeWrapper<T>(node))
      .filter(node => node.dependencies.length > 0);
  }

  destroy() {
    this.el.remove();
  }
}
