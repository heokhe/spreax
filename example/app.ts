import Spreax, { state, computed, setIndex, push } from "../src";

const el = document.getElementById('app');
const n = state(2);
const dbl = computed(() => n.value * 2);
const hlf = computed(() => (dbl.value / 4).toFixed(1));
const pow2 = computed(() => n.value ** 2);
const sqrt = computed(() => Math.sqrt(n.value).toFixed(2));
const array = state([1, 2, 3]);
const dblarray = computed(() => array.value.map(x => x * n.value))
const app = new Spreax(el, { n, dbl, hlf, pow2, sqrt, array, dblarray });

setIndex(array, 0, 7);
push(array, 9);
push(array, 10);
push(array, 11);
push(array, -1);
setIndex(array, 2, 85);

globalThis.app = app;