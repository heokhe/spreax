import { Context } from "./context";
import { getAllNodes, ElementOrNode, getDirectives, getAllElements } from "./dom";
import { Object } from "./types";

type Options<T extends Object> = {
  el: Element,
  state: T
}

declare global {
  interface Node {
    _spreax: Spreax
    _ctx: Context
  }
}

export class Spreax<T extends Object = Object> {
  $el: Element;
  $ctx: Context<T>;
  constructor(options: Options<T>) {
    const { el, state } = options;
    this.$el = el;
    this.$ctx = new Context(state);

    this.setupElement(el);
    for (const elm of getAllElements(el)) {
      this.setupElement(elm);
    }
  }

  setupElement(el: Element) {
    el._spreax = this;
    el._ctx = new Context({}, this.$ctx);
    const directives = getDirectives(el);
    for (const directive of directives) {
      switch (directive.name) {
        case 'text':
          el._ctx.on(directive.value, () => {
            el.textContent = el._ctx.get(directive.value)
          }, true)
          break
        default:
          break;
      }
    }
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
