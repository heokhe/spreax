import {
  state, action, increase, derived, component
} from '../src/index';

const Template = `<p>
  <my-paragraph>@(m):@(s)</my-paragraph>
  <button @on:click="reset()">Reset</button>
</p>`;

export default component(Template, () => {
  const seconds = state(0);
  const reset = action(() => seconds.set(0));
  const m = derived(() => Math.floor(seconds.value / 60).toString().padStart(2, '0'));
  const s = derived(() => (seconds.value % 60).toString().padStart(2, '0'));
  setInterval(() => increase(seconds), 1000);
  return {
    seconds, reset, m, s
  };
});
