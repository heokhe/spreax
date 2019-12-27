import { Context, findContext } from './context';
import {
  getAllTextNodes, getDirectives, getAllElements
} from './dom';
import { Dict, SpreaxOptions, Methods } from './types';
import createTemplate from './template';
import { bind } from './bind'
import { each } from './each'

export class Spreax<T extends Dict, M extends Methods> {
  $el: Element;
  $ctx: Context<T>;

  constructor(options: SpreaxOptions<T, M>) {
    const { el: rootEl, state, methods } = options;
    this.$el = rootEl;
    this.$ctx = new Context({ state, methods });

    this.setupElement(rootEl, new Context({
      state: {}, methods: {}, parent: this.$ctx
    }));
    for (const el of getAllElements(rootEl))
      this.setupElement(el);
  }

  setupElement(el: Element, context?: Context): void {
    if (!el.parentElement) return;
    if (context)
      el._ctx = context;
    for (const { name, value, param } of getDirectives(el)) {
      if (name === 'bind')
        this.handleInput(el as HTMLInputElement, value);
      else if (name === 'on')
        this.handleAction(el, param, value);
      else if (name === 'each')
        this.handleEach(el, value, param);
    }
    for (const textNode of getAllTextNodes(el))
      this.setupTextNode(textNode)
  }

  setupTextNode(node: Node): void {
    const { variables, render } = createTemplate(node.textContent);
    if (!variables.length) return;
    const ctx = findContext(node);
    for (const variable of variables) {
      ctx.on(variable, () => {
        node.textContent = render(ctx);
      }, true)
    }
  }

  handleAction(el: Element, eventName: string, methodName: string): void {
    const ctx = findContext(el);
    el.addEventListener(eventName, event => {
      ctx.getMethod(methodName)?.call(this)
    })
  }
}
