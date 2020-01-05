import { state } from "../../src/state";
import { Subscriber } from "../../src/subscriber";

class TestSubscriber extends Subscriber<{ char: string }> {}

describe('Subscribables and subscribers', () => {
  // we'll use a state variable as a subscribable
  const char = state('A');
  const subscriber = new TestSubscriber();
  it('Subscribes', () => {
    subscriber.subscribeTo('char', char);
    expect(subscriber.context).toHaveProperty('char');
    expect(subscriber.context.char).toBe(char);
  })
  it('Gets notified about updates', () => {
    let called = 0;
    subscriber.listenFor('char', () => {
      called++;
    }, true);
    expect(called).toEqual(1);
    char.set('B');
    expect(called).toEqual(2);
  })
})