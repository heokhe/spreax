import { Variables, getVariablesFromObject } from './core/variables';
import { makeElementTree } from './dom';
import { Wrapper } from './wrapper';
import { TextNodeWrapper } from './text-node-wrapper';
import { DerivedVariable } from './core/derived';
import { Actions } from './core/actions';
import { checkAndCast } from './helpers';
import { LoopHandler } from './directives/handlers/for';

export class Spreax<T, E extends Element, A extends string> {
  readonly el: E;

  variables: Variables<T>;

  readonly actions: Actions<A>;

  constructor(
    rootElOrSelector: E | string,
    variables: Variables<T>,
    actions: Actions<A> = {} as Actions<A>
  ) {
    const rootEl: E = typeof rootElOrSelector === 'string'
      ? document.querySelector(rootElOrSelector)
      : rootElOrSelector;
    this.el = rootEl;
    this.variables = variables;
    this.actions = actions;
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

  checkAndCastVarName(wrapper: Wrapper<T>, varName: string) {
    return checkAndCast({ ...this.variables, ...wrapper.context }, varName);
  }
}
