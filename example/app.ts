import Spreax, { state, derived, unshift } from '../src/index';

const x = state(2);
const array = state([1, 2, 3, 9, 7]);
const mappedArray = derived(() => array.value.map(n => n * x.value));
const app = new Spreax(
  '#app',
  { x, array, mappedArray },
  {
    addANumber() {
      unshift(array, Math.round(Math.random() * 20));
    }
  }
);

globalThis.app = app;
