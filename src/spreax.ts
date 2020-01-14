import { Variables, getVariablesFromObject } from "./variables";
import { makeElementTree } from './dom';
import { ElementWrapper } from './element-wrapper';
import { TextNodeWrapper } from './text-node-wrapper';
import { handleBind } from './bind';
import { handleFor } from './for';
import { handleAttr } from './attr';
import { ComputedVariable } from "./computed";

export class Spreax<T, E extends Element = Element> {
  el: E;
  variables: Variables<T>;
  constructor(rootEl: E, variables: Variables<T>) {
    this.el = rootEl;
    this.variables = variables;
    this.setupComputedVars();
    for (const el of makeElementTree(rootEl))
      this.setupElement(el);
  }

  setupComputedVars() {
    const variablesArray = getVariablesFromObject(this.variables);
    for (const v1 of variablesArray)
      if (v1 instanceof ComputedVariable)
        for (const v2 of variablesArray)
          if (v2 !== v1)
            v1.subscribeAndAutoCompute(v2);
  }

  setupElement(el: Element) {
    this.setupWrapper(new ElementWrapper<T>(el));
  }

  setupWrapper(wrapper: ElementWrapper<T>) {
    const { bind, $for, boundAttributes } = wrapper.directives();

    this.handleFor(wrapper, $for);
    this.handleBind(wrapper, bind);
    this.bindAttributes(wrapper, boundAttributes)

    for (const node of wrapper.nodes)
      this.setupNode(node);
  }

  bindAttributes(wrapper: ElementWrapper<T>, boundAttributes: { name: string; value: string }[]) {
    for (const { name, value } of boundAttributes) {
      if (value in wrapper.context || value in this.variables) {
        wrapper.subscribeTo(value as keyof T, this.variables[value])
        handleAttr(wrapper, name, value as keyof T);
      }
    }
  }

  handleFor(wrapper: ElementWrapper<T>, data: { variableName: string; arrayName: string }) {
    if (data && data.arrayName in this.variables) {
      const arrayName = data.arrayName as keyof T;
      if (this.variables[arrayName].value instanceof Array) {
        wrapper.subscribeTo(arrayName, this.variables[arrayName]);
        handleFor({
          arrayName, varName: data.variableName, wrapper,
          onCreate: wr => this.setupWrapper(wr as ElementWrapper<T>)
        })
      }
    }
  }

  handleBind(wrapper: ElementWrapper<T>, varName: string) {
    if (wrapper.el.tagName === 'INPUT' && varName && varName in this.variables) {
      const v = varName as keyof T;
      wrapper.subscribeTo(v, this.variables[v]);
      handleBind(wrapper as ElementWrapper<T, HTMLInputElement>, v);
    }
  }

  setupNode(node: TextNodeWrapper<T>) {
    for (const dep of node.dependencies) {
      node.subscribeTo(dep, this.variables[dep]);
      node.listenFor(dep, () => node.setText());
    }
    node.setText();
  }
}
