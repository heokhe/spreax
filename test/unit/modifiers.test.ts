import { state } from '../../src/core/state';
import * as helpers from '../../src/core/modifiers';

const numbers = state([0]);

describe('Array modifiers', () => {
  it('Pushes items', () => {
    helpers.push(numbers, 1, 2);
    expect(numbers.value).toEqual([0, 1, 2]);
  });
  it('Unshifts items', () => {
    helpers.unshift(numbers, -1);
    expect(numbers.value).toHaveLength(4);
    expect(numbers.value[0]).toEqual(-1);
  });
});

const object = state({ bar: 1, baz: 2, foo: 3 });

describe('Object modifiers', () => {
  it('Can merge objects', () => {
    helpers.merge(object, { foo: 0, baz: 9 });
    expect(object.value.foo).toEqual(0);
    expect(object.value.baz).toEqual(9);
  });
  it('Can modify a specific key', () => {
    helpers.set(object, 'bar', -1);
    expect(object.value.bar).toEqual(-1);
  });
});
