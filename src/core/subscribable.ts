export type Subscription<T> = (value: T, prevValue?: T) => any

export abstract class Subscribable<T> {
  value: T;
  prevValue: T = undefined;
  subscriptions: Subscription<T>[] = [];
  subscribe(callback: Subscription<T>, immediate = false) {
    this.subscriptions.push(callback);
    if (immediate)
      this.call(callback);
  }
  changeValue(newValue: T) {
    if (this.value !== newValue) {
      this.prevValue = this.value;
      this.value = newValue;
      this.push();
    }
  }
  push() {
    this.subscriptions.forEach(this.call.bind(this))
  }
  call(subscription: Subscription<T>) {
    subscription.call(null, this.value, this.prevValue);
  }
}

