import { Context, findContext } from './context';
import {
  getAllTextNodes, getDirectives, getAllElements
} from './dom';
import { Dict, SpreaxOptions, Methods } from './types';
import createTemplate from './template';

export class Spreax<T extends Dict, M extends Methods> {
  $el: Element;
  $ctx: Context<T>;

  constructor(options: SpreaxOptions<T, M>) {
    const { el: rootEl, state, methods } = options;
    this.$el = rootEl;
    this.$ctx = new Context({ state, methods });

    rootEl._ctx = new Context({ state: {}, methods: {}, parent: this.$ctx });
    this.setupElement(rootEl);
    for (const el of getAllElements(rootEl))
      this.setupElement(el);
  }

  setupElement(el: Element): void {
    for (const { name, value, param } of getDirectives(el)) {
      if (name === 'bind')
        this.handleInput(el as HTMLInputElement, value);
      else if (name === 'on')
        this.handleAction(el, param, value);
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

  handleInput(input: HTMLInputElement, prop: string): void {
    const ctx = findContext(input);
    ctx.on(prop, () => 
      input.value = ctx.get(prop)
    , true);
    input.addEventListener('keydown', () => {
      setTimeout(() => ctx.set(prop, input.value), 0);
    })
  }

  handleAction(el: Element, eventName: string, methodName: string): void {
    const ctx = findContext(el);
    el.addEventListener(eventName, event => {
      ctx.getMethod(methodName)?.call(this)
    })
  }
}
