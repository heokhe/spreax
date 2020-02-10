import { Variables, getVariablesFromObject } from './core/variables';
import { createElementTree } from './dom';
import { Wrapper } from './wrappers/element';
import { TextNodeWrapper } from './wrappers/text-node';
import { DerivedVariable } from './core/derived';
import { ForHandler } from './directives/handlers/for';
import { DirectiveHandler } from './directives/handler';
import { IfHandler } from './directives/handlers/if';
import { OnHandler } from './directives/handlers/on';
import { AttrHandler } from './directives/handlers/attr';
import { BindHandler } from './directives/handlers/bind';
import { CssHandler } from './directives/handlers/css';
import { ClassHandler } from './directives/handlers/class';

export class Spreax<T, E extends Element> {
  readonly el: E;

  variables: Variables<T>;

  constructor(
    rootElOrSelector: E | string,
    variables: Variables<T>
  ) {
    const rootEl: E = typeof rootElOrSelector === 'string'
      ? document.querySelector(rootElOrSelector)
      : rootElOrSelector;
    this.el = rootEl;
    this.variables = variables;
    this.setupDerivedVars();
    for (const el of createElementTree(rootEl))
      this.setupElement(el);
  }

  private setupDerivedVars() {
    const variablesArray = getVariablesFromObject(this.variables);
    for (const v1 of variablesArray)
      if (v1 instanceof DerivedVariable)
        for (const v2 of variablesArray)
          if (v2 !== v1)
            v1.subscribeAndAutoCompute(v2);
  }

  private getDirectiveHandlers(): DirectiveHandler<T>[] {
    return [
      new ForHandler<T>(this.setupWrapper.bind(this)),
      new IfHandler<T>(),
      new OnHandler<T>(),
      new AttrHandler<T>(),
      new BindHandler<T>(),
      new CssHandler<T>(),
      new ClassHandler<T>()
    ];
  }

  private setupElement(el: Element) {
    this.setupWrapper(new Wrapper<T>(el));
  }

  private setupWrapper(wrapper: Wrapper<T>) {
    for (const handler of this.getDirectiveHandlers())
      handler.start(wrapper, this.variables);
    for (const node of wrapper.nodes)
      this.setupNode(node);
  }

  private setupNode(node: TextNodeWrapper<T>) {
    for (const dep of node.dependencies) {
      node.addToContextIfNotPresent(dep, this.variables[dep]);
      node.subscribeTo(dep, () => node.setText());
    }
    node.setText();
  }
}
