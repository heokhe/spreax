import { findContext } from "./context";

export function bind(input: HTMLInputElement, prop: string): void {
  const ctx = findContext(input);
  ctx.on(prop, () => {
    input.value = ctx.get(prop)
  }, true);
  input.addEventListener('keydown', () => {
    setTimeout(() => {
      ctx.set(prop, input.value)
    }, 0);
  })
}