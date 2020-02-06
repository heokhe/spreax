import { Subscriber } from './core/subscriber';
import { TextNodeWrapper } from './text-node-wrapper';
import { DirectiveHandler } from './directives/handler';
import { IfHandler } from './directives/handlers/if';
import { AttrHandler } from './directives/handlers/attr';
import { BindHandler } from './directives/handlers/bind';
import { CssHandler } from './directives/handlers/css';
import { OnHandler } from './directives/handlers/on';

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

  get directives(): DirectiveHandler<T>[] {
    return [
      new IfHandler<T>(),
      new OnHandler<T>(),
      new AttrHandler<T>(),
      new BindHandler<T>(),
      new CssHandler<T>()
    ];
  }
}
