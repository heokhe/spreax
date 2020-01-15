import Spreax, { state, derived, unshift } from "../src/index";

const windowSize = derived(() => window.innerWidth);
window.addEventListener('resize', () => windowSize.compute());
const isTablet = derived(() => windowSize.value >= 768);

const el = document.getElementById('app');
const n = state(2);
const array = state([1, 2, 3, 9, 7]);
const dblarray = derived(() => array.value.map(x => x * n.value));
const app = new Spreax(
  el,
  { n, array, dblarray, windowSize, isTablet },
  {
    addANumber() {
      unshift(array, Math.round(Math.random() * 20))
    }
  }
);

globalThis.app = app;