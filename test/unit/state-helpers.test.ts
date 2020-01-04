import { state } from "../../src/state";
import * as helpers from '../../src/state-helpers';

const numbers = state([0]);

describe('Array helpers', () => {
  it('Pushes items', () => {
    helpers.push(numbers, 1, 2);
    expect(numbers.value).toEqual([0, 1, 2]);
  })
  it('Unshifts items', () => {
    helpers.unshift(numbers, -1);
    expect(numbers.value).toHaveLength(4);
    expect(numbers.value[0]).toEqual(-1);
  })
})