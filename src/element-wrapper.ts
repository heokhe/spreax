import { Subscriber } from "./subscriber";
import { TextNodeWrapper } from "./text-node-wrapper";

export class ElementWrapper<T, E extends Element = Element> extends Subscriber<T> {
  el: E;
  nodes: TextNodeWrapper<T>[];
  constructor(element: E) {
    super();
    this.el = element;
    this.nodes = this.getNodes();
  }

  getNodes() {
    return [...this.el.childNodes]
      .filter(node => node.nodeType === Node.TEXT_NODE)
      .map(node => new TextNodeWrapper<T>(node))
      .filter(node => node.dependencies.length > 0)
  }

  directives() {
    const { el } = this,
      each = el.getAttribute('@each'),
      [variableName, arrayName] = each?.split(' in ') ?? [];
    return {
      bind: el.getAttribute('@bind') ?? undefined,
      each: each ? { variableName, arrayName } : undefined
    }
  }

  destroy() {
    this.el.remove();
  }
}
