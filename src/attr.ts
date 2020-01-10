import { ElementWrapper } from "./element-wrapper";

export function handleAttr<T>(
  wrapper: ElementWrapper<T>,
  attrName: string,
  varName: keyof T
){
  wrapper.listenFor(varName, value => {
    wrapper.el.setAttribute(attrName, String(value));
  }, true);
}