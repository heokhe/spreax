import { state } from '../../src/core/state';
import { derived } from '../../src/core/derived';

const number = state(10);
describe('State variables', () => {
  it('Changes', () => {
    expect(number.value).toEqual(10);
    number.set(5);
    expect(number.value).toEqual(5);
    number.update(n => n ** 2);
    expect(number.value).toEqual(25);
  });
});

describe('Derived variables', () => {
  const double = derived(() => number.value * 2);
  double.subscribeAndAutoCompute(number); // you don't need to manually call this in real world
  it('Holds the value', () => {
    number.set(10);
    expect(double.value).toEqual(20);
  });
  it('Can re-compute the value', () => {
    number.set(1);
    expect(double.value).toEqual(2);
  });
});
