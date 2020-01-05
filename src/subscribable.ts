export type Subscription<T> = (value: T) => any

export abstract class Subscribable<T> {
  value: T;
  subscriptions: Subscription<T>[] = [];
  subscribe(callback: Subscription<T>, immediate = false) {
    this.subscriptions.push(callback);
    if (immediate)
      callback.call(null, this.value);
  }
  push() {
    this.subscriptions.forEach(subscription => {
      subscription.call(null, this.value);
    })
  }
}

