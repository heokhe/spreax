import { state } from "../../src/state"
import { computed } from "../../src/computed"

const number = state(10);
describe('State variables', () => {
  it('Changes', () => {
    expect(number.value).toEqual(10);
    number.set(5);
    expect(number.value).toEqual(5);
    number.update(n => n ** 2);
    expect(number.value).toEqual(25);
  })
})

describe('Computed variables', () => {
  number.set(10);
  const double = computed(() => number.value * 2);
  it('Holds the value', () => {
    expect(double.value).toEqual(20);
  })
  it('Can re-compute the value', () => {
    number.set(1);
    double.compute(); // you don't need to manually call this in real world
    expect(double.value).toEqual(2);
  })
})