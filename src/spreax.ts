import { Variables, autoComputeAllDerivedVars } from './core/variables';
import { createElementTree, isComponent } from './dom';
import { Wrapper, wrap } from './wrappers/element';
import { TextNodeWrapper } from './wrappers/text-node';
import { ForHandler } from './directives/handlers/for';
import { DirectiveHandler } from './directives/handler';
import { IfHandler } from './directives/handlers/if';
import { OnHandler } from './directives/handlers/on';
import { AttrHandler } from './directives/handlers/attr';
import { BindHandler } from './directives/handlers/bind';
import { CssHandler } from './directives/handlers/css';
import { ClassHandler } from './directives/handlers/class';
import { HtmlHandler } from './directives/handlers/html';
import { Component } from './components/component';

export class Spreax<T, C, E extends HTMLElement> {
  readonly el: E;

  variables: Variables<T>;

  components: { [x in keyof C]?: Component<C[x]> } = {};

  constructor(
    rootElOrSelector: E | string,
    variables: Variables<T>,
    components: {
      [x in keyof C]?: Component<C[x]>
    } = {}
  ) {
    const rootEl: E = typeof rootElOrSelector === 'string'
      ? document.querySelector(rootElOrSelector)
      : rootElOrSelector;
    this.el = rootEl;
    this.variables = variables;
    this.components = components;
    autoComputeAllDerivedVars(this.variables);
    this.setupElement(rootEl, this.variables);
  }

  private setupElement<U>(rootEl: HTMLElement, context: Variables<U>) {
    for (const el of createElementTree(rootEl))
      this.setupWrapper(wrap<U>(el), context);
    for (const componentInstance of createElementTree(rootEl, true))
      this.setupComponent(componentInstance);
  }

  private setupComponent(componentInstance: HTMLElement) {
    const componentName = componentInstance.tagName.toLowerCase();
    const component = this.components[componentName as keyof C];
    if (component) {
      component.setNameAndCallback(componentName, (componentRoot, componentContext) => {
        this.setupElement(componentRoot, componentContext);
      });
      component.registerIfNotRegistered();
    }
  }

  private getDirectiveHandlers<U>(context: Variables<U>): DirectiveHandler<U>[] {
    return [
      new HtmlHandler<U>(),
      new ForHandler<U>(wrapper => {
        this.setupWrapper(wrapper, context);
        if (isComponent(wrapper.el))
          this.setupComponent(wrapper.el);
      }),
      new IfHandler<U>(),
      new OnHandler<U>(),
      new AttrHandler<U>(),
      new BindHandler<U>(),
      new CssHandler<U>(),
      new ClassHandler<U>()
    ];
  }

  private setupWrapper<U>(wrapper: Wrapper<U>, context: Variables<U>) {
    for (const handler of this.getDirectiveHandlers(context))
      handler.start(wrapper, context);
    if (!wrapper.el.hasAttribute('@for'))
      for (const node of wrapper.nodes)
        this.setupNode(node, context);
  }

  private setupNode<U>(node: TextNodeWrapper<U>, context: Variables<U>) {
    for (const dep of node.dependencies) {
      node.addToContextIfNotPresent(dep, context[dep]);
      node.subscribeTo(dep, () => node.setText());
    }
    node.setText();
  }
}
