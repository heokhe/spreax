import { Spreax } from "../src/spreax";
import { state } from "../src/state";
import { computed } from "../src/computed";

const el = document.getElementById('app');
const n = state(2);
const dbl = computed(() => n.value * 2);
const hlf = computed(() => n.value / 2);
const pow2 = computed(() => n.value ** 2);
const sqrt = computed(() => Math.sqrt(n.value));
const app = new Spreax(el, { n, dbl, hlf, pow2, sqrt });

globalThis.app = app;