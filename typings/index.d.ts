type Subscription<T> = (value: T) => any;

declare abstract class Subscribable<T> {
  value: T;
  prevValue: T;
  subscriptions: Subscription<T>[];
  subscribe(callback: Subscription<T>, immediate?: boolean): void;
  changeValue(newValue: T): void;
  push(): void;
  call(subscription: Subscription<T>): void;
}

declare class StateVariable<T> extends Subscribable<T> {
  constructor(value: T);
  set(newValue: T): void;
  update(fn: (value: T) => T): void;
}
declare function state<T>(value: T): StateVariable<T>;

type Computable<T> = () => T;
declare class ComputedVariable<T> extends Subscribable<T> {
  fn: Computable<T>;
  constructor(fn: Computable<T>);
  compute(): void;
  subscribeAndAutoCompute<T>(state: Subscribable<T>): void;
}
declare function computed<T>(fn: Computable<T>): ComputedVariable<T>;

type Variable<T> = ComputedVariable<T> | StateVariable<T>;
type Variables<T> = {
  [x in keyof T]: Variable<T[x]>;
};

declare abstract class Subscriber<C> {
  context: Variables<C>;
  constructor();
  /**
   * Subscribes the object to a `Subscribable`.
   * Silently fails if `name` already exists.
   */
  addToContextIfNotPresent<K extends keyof C, V extends Variable<C[K]>>(name: K, variable: V): void;
  subscribeTo<K extends keyof C>(name: K, callback: Subscription<C[K]>, immediate?: boolean): void;
}

export declare class TextNodeWrapper<T> extends Subscriber<T> {
  node: Node;
  initialText: string;
  sections: string[];
  dependencies: (keyof T)[];
  constructor(node: Node);
  render(): string;
  setText(): void;
}

declare class Wrapper<T, E extends Element = Element> extends Subscriber<T> {
  el: E;
  nodes: TextNodeWrapper<T>[];
  attrs: Attr[];
  constructor(element: E);
  getNodes(): TextNodeWrapper<T>[];
  destroy(): void;
  get $for(): {
    variableName: string;
    arrayName: string;
    indexName: string;
  };
  get boundAttributes(): {
    name: string;
    value: string;
  }[];
  get eventListeners(): {
    eventName: string;
    actionName: string;
  }[];
  get bind(): string;
  get $if(): string;
  get directives(): {
    $for: {
      variableName: string;
      arrayName: string;
      indexName: string;
    };
    bind: string;
    boundAttributes: {
      name: string;
      value: string;
    }[];
    eventListeners: {
      eventName: string;
      actionName: string;
    }[];
    $if: string;
  };
}

declare type Action = <E extends Event>(event?: E) => any;
declare type Actions<K extends string> = {
  [x in K]: Action;
};

declare class Spreax<T, E extends Element, A extends string> {
  readonly el: E;
  variables: Variables<T>;
  readonly actions: Actions<A>;
  constructor(rootElOrSelector: E | string, variables: Variables<T>, actions?: Actions<A>);
  setupderivedVars(): void;
  setupElement(el: Element): void;
  setupWrapper(wrapper: Wrapper<T>): void;
  handleIf(wrapper: Wrapper<T>, varName: string): void;
  bindAttributes(wrapper: Wrapper<T>, boundAttributes: {
    name: string;
    value: string;
  }[]): void;
  handleFor(wrapper: Wrapper<T>, data: {
    variableName: string;
    arrayName: string;
    indexName: string;
  }): void;
  handleBind(wrapper: Wrapper<T>, varName: string): void;
  setupNode(node: TextNodeWrapper<T>): void;
  checkAndCastVarName(wrapper: Wrapper<T>, varName: string): keyof T;
}

declare function push<T>(state: StateVariable<T[]>, ...items: T[]): void;
declare function unshift<T>(state: StateVariable<T[]>, ...items: T[]): void;
declare function merge<T extends object>(state: StateVariable<T>, sourceObject: {
  [x in keyof T]?: T[x];
}): void;
declare function set<T extends object, K extends keyof T>(state: StateVariable<T>, key: K, value: T[K]): void;
declare function setIndex<T>(state: StateVariable<T[]>, index: number, newValue: T): void;
declare function splice<T>(state: StateVariable<T[]>, start: number, deleteCount: number, ...items: T[]): void;
declare function inc(state: StateVariable<number>, x?: number): void;
declare function dec(state: StateVariable<number>, x?: number): void;

export { Spreax as default, state, computed, push, unshift, merge, set, setIndex, inc, dec, splice };