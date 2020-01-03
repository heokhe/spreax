import { state } from "../../src/state";
import { Subscriber } from "../../src/subscriber";

describe('Subscribables and subscribers', () => {
  // we'll use a state variable as a subscribable
  const char = state('A');
  const subscriber = new Subscriber<{ char: string }>();
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