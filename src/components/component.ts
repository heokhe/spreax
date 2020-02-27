import { Variables } from '../core/variables';
import { createTemplateElement } from './create-template';
import { createClass } from './create-class';

export type ComponentTemplate = HTMLTemplateElement | string | Promise<string>;
export type ComponentSetupArg = {
  dispatch(type: string, details: any): void;
}
export type ComponentSetupFunction<T> = (arg: ComponentSetupArg) => Variables<T>;
export type ComponentCallback<T> = (root: HTMLElement, context: Variables<T>) => void

export class Component<T> {
  name: string;

  private templateOption: ComponentTemplate;

  callback: ComponentCallback<T>;

  setup: ComponentSetupFunction<T>;

  observedAttributes: (keyof T)[]

  constructor(
    template: ComponentTemplate,
    setup: ComponentSetupFunction<T>,
    propNames: (keyof T)[]
  ) {
    this.templateOption = template;
    this.setup = setup;
    this.observedAttributes = propNames;
  }

  getTemplateEl() {
    return createTemplateElement(this.templateOption);
  }

  private getClass() {
    return createClass(this);
  }

  setNameAndCallback(name: string, callback: ComponentCallback<T>) {
    this.name = name;
    this.callback = callback;
  }

  registerIfNotRegistered() {
    if (!customElements.get(this.name))
      customElements.define(this.name, this.getClass());
  }
}

export const component = <T>(
  template: ComponentTemplate,
  setup: ComponentSetupFunction<T> = () => ({} as Variables<T>),
  propNames: (keyof T)[] = []
) => new Component<T>(template, setup, propNames);
