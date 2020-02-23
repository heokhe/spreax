type Subscription<T> = (value: T, prevValue?: T) => any;
type UpdateFn<T> = (value: T) => T;
declare abstract class Subscribable<T> {
    value: T;
    prevValue: T;
    private subscriptions;
    abstract set(value: T): void;
    update(fn: UpdateFn<T>): void;
    subscribe(callback: Subscription<T>, immediate?: boolean): void;
    protected changeValue(newValue: T): void;
    protected push(): void;
    private call;
}
type Variable<T> = Subscribable<T>;
type Variables<T> = {
    [x in keyof T]: Variable<T[x]>;
};
declare class Spreax<T, E extends HTMLElement> {
    readonly el: E;
    variables: Variables<T>;
    constructor(rootElOrSelector: E | string, variables: Variables<T>);
    private setupDerivedVars;
    private getDirectiveHandlers;
    private setupElement;
    private setupWrapper;
    private setupNode;
}
declare class StateVariable<T> extends Subscribable<T> {
    constructor(value: T);
    set(newValue: T): void;
}
declare function state<T>(value: T): StateVariable<T>;
type DerivedGetter<T> = () => T;
type DerivedSetter<T> = (prevValue: T) => void;
declare class DerivedVariable<T> extends Subscribable<T> {
    private getter;
    private setter;
    private autoDependencies;
    constructor(getter: DerivedGetter<T>, setter?: DerivedSetter<T>);
    compute(): void;
    subscribeAndAutoCompute(subscribable: Subscribable<any>): void;
    set(newValue: T): void;
}
declare function derived<T>(getter: DerivedGetter<T>, setter?: DerivedSetter<T>): DerivedVariable<T>;
declare class Constant<T> extends Subscribable<T> {
    constructor(value: T);
    set(): any;
}
declare const constant: <T>(value: T) => Constant<T>;
type ActionFn<E extends Event = Event> = (event?: E, ...args: any[]) => any;
type ActionVariable<E extends Event = Event> = Constant<ActionFn<E>>;
declare const action: <E extends Event = Event>(callback: ActionFn<E>) => ActionVariable<E>;
declare function push<T>(state: Variable<T[]>, ...items: T[]): void;
declare function unshift<T>(state: Variable<T[]>, ...items: T[]): void;
declare function merge<T extends object>(state: Variable<T>, sourceObject: {
    [x in keyof T]?: T[x];
}): void;
declare function set<T extends object, K extends keyof T>(state: Variable<T>, key: K, value: T[K]): void;
declare function setPath(state: Variable<any>, path: string[], value: any): void;
declare function setIndex<T>(state: Variable<T[]>, index: number, newValue: T): void;
declare function splice<T>(state: Variable<T[]>, start: number, deleteCount: number, ...items: T[]): void;
declare function increase(state: Variable<number>, x?: number): void;
declare function decrease(state: Variable<number>, x?: number): void;
export { Spreax as default, state, derived, constant, action, push, unshift, merge, set, setPath, setIndex, splice, increase, decrease };
