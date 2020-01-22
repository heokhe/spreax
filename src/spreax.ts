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
    const n = this.castVarNameIfExists(wrapper, varName);
    if (n) {
      const v = this.variables[n];
      wrapper.addToContextIfNotPresent(n, v);
      handleIf(wrapper, n);
    }
  }

  bindAttributes(wrapper: Wrapper<T>, boundAttributes: { name: string; value: string }[]) {
    for (const { name, value } of boundAttributes) {
      const varName = this.castVarNameIfExists(wrapper, value);
      if (varName) {
        wrapper.addToContextIfNotPresent(varName, this.variables[varName])
        handleAttr(wrapper, name, varName);
      }
    }
  }

  handleFor(wrapper: Wrapper<T>, data: { variableName: string; arrayName: string; indexName: string }) {
    const arrayName = this.castVarNameIfExists(wrapper, data.arrayName);
    if (arrayName) {
      if (this.variables[arrayName].value instanceof Array) {
        wrapper.addToContextIfNotPresent(arrayName, this.variables[arrayName]);
        handleFor({
          arrayName, varName: data.variableName, wrapper, indexName: data.indexName,
          onCreate: wr => this.setupWrapper(wr as Wrapper<T>)
        })
      }
    }
  }

  handleBind(wrapper: Wrapper<T>, varName: string) {
    const v = this.castVarNameIfExists(wrapper, varName);
    if (wrapper.el.tagName === 'INPUT' && v) {
      wrapper.addToContextIfNotPresent(v, this.variables[v]);
      handleBind(wrapper as Wrapper<T, HTMLInputElement>, v);
    }
  }

  setupNode(node: TextNodeWrapper<T>) {
    for (const dep of node.dependencies) {
      // may be present in the context, if node is created by a LoopHandler.
      node.addToContextIfNotPresent(dep, this.variables[dep]);
      node.subscribeTo(dep, () => node.setText());
    }
    node.setText();
  }

  castVarNameIfExists(wrapper: Wrapper<T>, varName: string) {
    return (varName && (varName in wrapper.context || varName in this.variables))
     ? varName as keyof T
     : undefined;
  }
}
