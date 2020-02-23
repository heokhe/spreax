import { Subscribable } from './subscribable';

type DerivedGetter<T> = () => T;
type DerivedSetter<T> = (prevValue: T) => void;

export class DerivedVariable<T> extends Subscribable<T> {
  private getter: DerivedGetter<T>;

  private setter: DerivedSetter<T>;

  private autoDependencies: Subscribable<any>[] = [];

  constructor(getter: DerivedGetter<T>, setter?: DerivedSetter<T>) {
    super();
    this.getter = getter;
    this.setter = setter;
    this.compute();
  }

  compute() {
    this.changeValue(this.getter());
  }

  subscribeAndAutoCompute(subscribable: Subscribable<any>) {
    if (!this.autoDependencies.includes(subscribable)) {
      subscribable.subscribe(() => this.compute());
      this.autoDependencies.push(subscribable);
    }
  }

  set(newValue: T) {
    this.setter?.(newValue);
  }
}

export function derived<T>(getter: DerivedGetter<T>, setter?: DerivedSetter<T>) {
  return new DerivedVariable(getter, setter);
}
