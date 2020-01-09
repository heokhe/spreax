import { ElementWrapper } from './element-wrapper';
import { Variables, groupVariables } from "./variables";
import { makeElementTree } from './dom';
import { handleBind } from './bind';
import { handleEach } from './each';
import { TextNodeWrapper } from './text-node-wrapper';

export class Spreax<T, E extends Element = Element> {
  el: E;
  variables: Variables<T>;
  constructor(rootEl: E, variables: Variables<T>) {
    this.el = rootEl;
    this.variables = variables;

    const { computedVars, stateVars } = groupVariables(variables);
    for (const computedVar of computedVars)
      for (const stateVar of stateVars)
        computedVar.subscribeAndAutoCompute(stateVar)

    for (const el of makeElementTree(rootEl))
      this.setupElement(el);
  }
  setupElement(el: Element) {
    this.setupWrapper(new ElementWrapper<T>(el));
  }
  setupWrapper(wrapper: ElementWrapper<T>) {
    const { el } = wrapper;

    const { bind, each } = wrapper.directives();
    if (el.tagName === 'INPUT' && bind && bind in this.variables) {
      const propName = bind as keyof T;
      wrapper.subscribeTo(propName, this.variables[propName]);
      handleBind(wrapper as ElementWrapper<T, HTMLInputElement>, propName);
    }
    if (each && each.arrayName in this.variables) {
      const arrayName = each.arrayName as keyof T;
      if (this.variables[arrayName].value instanceof Array) {
        wrapper.subscribeTo(arrayName, this.variables[arrayName]);
        handleEach({
          arrayName, varName: each.variableName, wrapper,
          onCreate: wr => this.setupWrapper(wr as ElementWrapper<T>)
        })
      }
    }

    if (!each)
      for (const node of wrapper.nodes)
        this.setupNode(node);
  }

  setupNode(node: TextNodeWrapper<T>) {
    for (const dep of node.dependencies) {
      node.subscribeTo(dep, this.variables[dep]);
      node.listenFor(dep, () => node.setText());
    }
    node.setText();
  }
}
