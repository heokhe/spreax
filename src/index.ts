import { Context, findContext } from './context';
import {
  getAllTextNodes, getDirectives, getAllElements
} from './dom';
import { Dict, SpreaxOptions } from './types';
import createTemplate from './template';

export class Spreax<T extends Dict> {
  $el: Element;
  $ctx: Context<T>;

  constructor(options: SpreaxOptions<T>) {
    const { el, state } = options;
    this.$el = el;
    this.$ctx = new Context(state);

    this.setupElement(el);
    for (const elm of getAllElements(el))
      this.setupElement(elm);
  }

  setupElement(el: Element): void {
    if (el === this.$el)
      el._ctx = new Context({}, this.$ctx);
    for (const { name, value } of getDirectives(el)) {
      if (name === 'bind')
        this.handleInput(el as HTMLInputElement, value);
      // else if (name === 'for')
      //   this.handleLoop
    }
    for (const textNode of getAllTextNodes(el))
      this.setupTextNode(textNode)
  }

  setupTextNode(node: Node): void {
    const { variables, render } = createTemplate(node.textContent);
    if (!variables.length) return;
    const ctx = this.findContext(node);
    for (const variable of variables) {
      ctx.on(variable, () => {
        node.textContent = render(ctx);
      }, true)
    }
  }

  handleInput(input: HTMLInputElement, prop: string): void {
    const ctx = this.findContext(input);
    ctx.on(prop, () => 
      input.value = ctx.get(prop)
    , true);
    input.addEventListener('keydown', () => {
      setTimeout(() => {
        ctx.set(prop, input.value);
      }, 0);
    })
  }

  findContext(node: Node) {
    return findContext(node);
  }

  // $handleNode(target) {
  //   const ctx = this.$ctx;

  //   if (isText(target)) {
  //     const text = target.textContent;
  //     if (/^\s*$/.test(text)) return;

  //     const template = createTemplate(text, this.$formatters);
  //     for (const v of template.vars) {
  //       ctx.$on(v, () => {
  //         target.textContent = template.render(ctx);
  //       }, true);
  //     }
  //   } else if (isElement(target)) {
  //     const selector = findSelector(target, this.$el);
  //     for (const di of getDirectives(target)) {
  //       const { name } = di;
  //       try {
  //         execute(name, {
  //           element: target,
  //           instance: this,
  //           param: di.param,
  //           options: di.options,
  //           value: di.value,
  //           context: ctx
  //         });
  //       } catch ({ message }) {
  //         throw new Error(`[@${name}] ${message}\n  found at: ${selector}`);
  //       }
  //     }
  //   }
  // }
}
