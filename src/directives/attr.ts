import { Wrapper } from "../wrapper";

export function handleAttr<T>(
  wrapper: Wrapper<T>,
  attrName: string,
  varName: keyof T
){
  const { el } = wrapper;
  wrapper.subscribeTo(varName, value => {
    if (typeof value === 'boolean') {
      if (value) el.setAttribute(attrName, '');
      else el.removeAttribute(attrName);
    } else {
      el.setAttribute(attrName, String(value));
    }
  }, true);
}