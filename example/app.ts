import Spreax, { state, computed } from "../src/spreax";

const el = document.getElementById('app');
const n = state(2);
const dbl = computed(() => n.value * 2);
const hlf = computed(() => (dbl.value / 4).toFixed(1));
const pow2 = computed(() => n.value ** 2);
const sqrt = computed(() => Math.sqrt(n.value).toFixed(2));
const app = new Spreax(el, { n, dbl, hlf, pow2, sqrt });

globalThis.app = app;