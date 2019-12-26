import { Context, findContext } from './context';
import {
  getAllTextNodes, getDirectives, getAllElements, isElement
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

  handleEach<T>(el: Element, prop: string, variableName: string): void {
    const array: T[] = findContext(el).get(prop);
    const child = el.firstElementChild;
    for (let i = 0; i < array.length; i++) {
      const item = array[i];
      const newChild = child.cloneNode(true);
      if (isElement(newChild)) {
        el.appendChild(newChild);
        this.setupElement(newChild, new Context({
          state: {}, methods: {},
          parent: findContext(newChild),
          constants: {
            i,
            [variableName]: item
          }
        }));
      }
    }
    el.removeChild(child);
  }
}
