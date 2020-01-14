import Spreax, { state, computed, inc } from "../src/index";

const windowSize = computed(() => window.innerWidth);
window.addEventListener('resize', () => windowSize.compute());
const isTablet = computed(() => windowSize.value >= 768);

const el = document.getElementById('app');
const n = state(2);
const array = state([1, 2, 3, 9, 7]);
const dblarray = computed(() => array.value.map(x => x * n.value));
const app = new Spreax(
  el,
  { n, array, dblarray, windowSize, isTablet },
  {
    increase(event) {
      console.log(event.target)
      inc(n);
    }
  }
);

globalThis.app = app;