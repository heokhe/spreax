import { ElementWrapper } from './element-wrapper';
import { Variables, groupVariables } from "./variables";
import { getAllElements } from './dom';
import { bind } from './bind';

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

    this.setupElement(rootEl);
    for (const el of getAllElements(rootEl))
      this.setupElement(el);
  }
  setupElement(element: Element) {
    const wrapper = new ElementWrapper<T>(element);
    for (const node of wrapper.nodes()) {
      for (const dep of node.dependencies) {
        node.subscribeTo(dep, this.variables[dep]);
        node.listenFor(dep, () => node.setText());
      }
      node.setText();
    }
    const bindValue = wrapper.el.getAttribute('@bind');
    if (wrapper.el.tagName === 'INPUT' && bindValue && bindValue in this.variables) {
      const propName = bindValue as keyof T;
      wrapper.subscribeTo(propName, this.variables[propName]);
      bind(wrapper as ElementWrapper<T, HTMLInputElement>, propName);
    }
  }
}