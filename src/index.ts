import { Context, findContext } from './context';
import {
  getAllTextNodes, getDirectives, getAllElements, isElement
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
    el._ctx = new Context({}, this.$ctx);
    for (const { name, value } of getDirectives(el)) {
      switch (name) {
        case 'bind':
          // const input = (el as HTMLInputElement);
          // input._ctx.on(value, () => 
          //   input.value = input._ctx.get(value)
          // , true);
          // input.addEventListener('keydown', () => {
          //   setTimeout(() => {
          //     el._ctx.set(value, input.value);
          //   }, 0);
          // })
          break;
        default:
          break;
      }
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
