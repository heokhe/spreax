export type Subscription<T> = (value: T) => any

export class Subscribable<T> {
  value: T;
  subscriptions: Subscription<T>[] = [];
  subscribe(callback: Subscription<T>) {
    this.subscriptions.push(callback);
  }
  push() {
    this.subscriptions.forEach(subscription => {
      subscription.call(null, this.value);
    })
  }
}

