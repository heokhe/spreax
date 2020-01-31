import { Subscribable } from './subscribable';

type DerivedGetter<T> = () => T;
type DerivedSetter<T> = (prevValue: T) => void;

export class DerivedVariable<T> extends Subscribable<T> {
  getter: DerivedGetter<T>;

  setter: DerivedSetter<T>;

  constructor(getter: DerivedGetter<T>, setter?: DerivedSetter<T>) {
    super();
    this.getter = getter;
    this.setter = setter;
    this.compute();
  }

  compute() {
    this.changeValue(this.getter.call(null));
  }

  subscribeAndAutoCompute<T>(stateVar: Subscribable<T>) {
    stateVar.subscribe(() => this.compute());
  }

  set(newValue: T) {
    this.setter?.(newValue);
  }
}

export function derived<T>(fn: DerivedGetter<T>) {
  return new DerivedVariable(fn);
}
