import { Wrapper } from "./wrapper";

export function handleIf<T>(wrapper: Wrapper<T>, varName: keyof T) {
  const comment = new Comment(),
    { el } = wrapper;
  el.before(comment);
  wrapper.subscribeTo(varName, condition => {
    return condition ? comment.after(el) : el.remove();
  }, true)
}