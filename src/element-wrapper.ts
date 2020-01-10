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

  destroy() {
    this.el.remove();
  }

  directives() {
    const { el } = this,
      $for = el.getAttribute('@for'),
      [variableName, arrayName] = $for?.split(/ (?:in|of) /) ?? [],
      boundAttributes = [...el.attributes]
        .filter(attr => attr.name.startsWith('$'))
        .map(attr => ({ name: attr.name.slice(1), value: attr.value }));
    return {
      bind: el.getAttribute('@bind') ?? undefined,
      $for: $for ? { variableName, arrayName } : undefined,
      boundAttributes
    }
  }
}
