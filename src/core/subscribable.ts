export type Subscription<T> = (value: T, prevValue?: T) => any

export type UpdateFn<T> = (value: T) => T;

export abstract class Subscribable<T> {
  value: T;

  prevValue: T = undefined;

  private subscriptions: Subscription<T>[] = [];

  abstract set(value: T): void;

  update(fn: UpdateFn<T>) {
    this.set(fn(this.value));
  }

  subscribe(callback: Subscription<T>, immediate = false) {
    this.subscriptions.push(callback);
    if (immediate)
      this.call(callback);
  }

  protected changeValue(newValue: T) {
    if (this.value !== newValue) {
      this.prevValue = this.value;
      this.value = newValue;
      this.push();
    }
  }

  protected push() {
    this.subscriptions.forEach(this.call.bind(this));
  }

  private call(subscription: Subscription<T>) {
    subscription.call(null, this.value, this.prevValue);
  }
}
