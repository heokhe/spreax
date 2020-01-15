import { ElementWrapper } from "./element-wrapper";

export function handleIf<T>(wrapper: ElementWrapper<T>, varName: keyof T) {
  const comment = new Comment(),
    { el } = wrapper;
  el.before(comment);
  wrapper.listenFor(varName, condition => {
    return condition ? comment.after(el) : el.remove();
  }, true)
}