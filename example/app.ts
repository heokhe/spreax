import { Spreax } from "../src";

const app = new Spreax({
  el: document.getElementById('app'),
  state: {
    a: 2,
    b: 8,
    c: 0,
    name: 'hkh12',
    arr: [4, 5, 2, 6, 3, 7, 8]
  },
  methods: {
    log() {
      this.$ctx.state.a **= 2;
    }
  }
})

globalThis.app = app;