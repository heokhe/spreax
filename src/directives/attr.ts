import { Wrapper } from "../wrapper";

export function handleAttr<T>(
  wrapper: Wrapper<T>,
  attrName: string,
  varName: keyof T
){
  wrapper.subscribeTo(varName, value => {
    wrapper.el.setAttribute(attrName, String(value));
  }, true);
}