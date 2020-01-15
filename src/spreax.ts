import { Variables, getVariablesFromObject } from "./variables";
import { makeElementTree } from './dom';
import { Wrapper } from './wrapper';
import { TextNodeWrapper } from './text-node-wrapper';
import { handleBind } from './bind';
import { handleFor } from './for';
import { handleAttr } from './attr';
import { DerivedVariable } from "./derived";
import { Actions } from "./actions";
import { handleIf } from "./if";

export class Spreax<T, E extends Element, A extends string> {
  readonly el: E;
  variables: Variables<T>;
  readonly actions: Actions<A>;
  constructor(
    rootEl: E,
    variables: Variables<T>,
    actions: Actions<A> = {} as Actions<A>
  ) {
    this.el = rootEl;
    this.variables = variables;
    this.actions = actions;
    this.setupderivedVars();
    for (const el of makeElementTree(rootEl))
      this.setupElement(el);
  }

  setupderivedVars() {
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
    const { bind, $for, boundAttributes, eventListeners, $if } = wrapper.directives;

    this.handleFor(wrapper, $for);
    this.handleBind(wrapper, bind);
    this.bindAttributes(wrapper, boundAttributes)
    this.handleIf(wrapper, $if)
    for (const { actionName, eventName } of eventListeners)
      wrapper.el.addEventListener(eventName, this.actions[actionName])
    for (const node of wrapper.nodes)
      this.setupNode(node);
  }

  handleIf(wrapper: Wrapper<T>, varName: string) {
    if (varName && (varName in wrapper.context || varName in this.variables)) {
      const n = varName as keyof T;
      const v = this.variables[n];
      wrapper.addToContext(n, v);
      handleIf(wrapper, n);
    }
  }

  bindAttributes(wrapper: Wrapper<T>, boundAttributes: { name: string; value: string }[]) {
    for (const { name, value } of boundAttributes) {
      if (value in wrapper.context || value in this.variables) {
        wrapper.addToContext(value as keyof T, this.variables[value])
        handleAttr(wrapper, name, value as keyof T);
      }
    }
  }

  handleFor(wrapper: Wrapper<T>, data: { variableName: string; arrayName: string; indexName: string }) {
    if (data && data.arrayName in this.variables) {
      const arrayName = data.arrayName as keyof T;
      if (this.variables[arrayName].value instanceof Array) {
        wrapper.addToContext(arrayName, this.variables[arrayName]);
        handleFor({
          arrayName, varName: data.variableName, wrapper, indexName: data.indexName,
          onCreate: wr => this.setupWrapper(wr as Wrapper<T>)
        })
      }
    }
  }

  handleBind(wrapper: Wrapper<T>, varName: string) {
    if (wrapper.el.tagName === 'INPUT' && varName && (varName in this.variables || varName in wrapper.context)) {
      const v = varName as keyof T;
      wrapper.addToContext(v, this.variables[v]);
      handleBind(wrapper as Wrapper<T, HTMLInputElement>, v);
    }
  }

  setupNode(node: TextNodeWrapper<T>) {
    for (const dep of node.dependencies) {
      node.addToContext(dep, this.variables[dep]);
      node.subscribeTo(dep, () => node.setText());
    }
    node.setText();
  }
}
