import { Variables, getVariablesFromObject } from './core/variables';
import { makeElementTree } from './dom';
import { Wrapper } from './wrapper';
import { TextNodeWrapper } from './text-node-wrapper';
import { DerivedVariable } from './core/derived';
import { LoopHandler } from './directives/handlers/for';

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
    for (const el of makeElementTree(rootEl))
      this.setupElement(el);
  }

  setupDerivedVars() {
    const variablesArray = getVariablesFromObject(this.variables);
    for (const v1 of variablesArray)
      if (v1 instanceof DerivedVariable)
        for (const v2 of variablesArray)
          if (v2 !== v1)
            v1.subscribeAndAutoCompute(v2);
  }

  setupElement(el: Element) {
    this.setupWrapper(new Wrapper<T>(el));
  }

  setupWrapper(wrapper: Wrapper<T>) {
    new LoopHandler<T>(this.setupWrapper.bind(this)).start(wrapper, this.variables);
    for (const handler of wrapper.directives)
      handler.start(wrapper, this.variables);
    for (const node of wrapper.nodes)
      this.setupNode(node);
  }

  setupNode(node: TextNodeWrapper<T>) {
    for (const dep of node.dependencies) {
      node.addToContextIfNotPresent(dep, this.variables[dep]);
      node.subscribeTo(dep, () => node.setText());
    }
    node.setText();
  }
}
