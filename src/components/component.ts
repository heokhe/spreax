import { Variables, autoComputeAllDerivedVars } from '../core/variables';
import { createTemplateElement } from './create-template';

export type ComponentTemplate = HTMLTemplateElement | string | Promise<string>;
export type ComponentSetupFunction<T> = () => Variables<T>;
export type ComponentCallback<T> = (root: HTMLElement, context: Variables<T>) => void

export class Component<T> {
  name: string;

  private templateOption: ComponentTemplate;

  callback: ComponentCallback<T>;

  setup: ComponentSetupFunction<T>;

  constructor(template: ComponentTemplate, setup: ComponentSetupFunction<T>) {
    this.templateOption = template;
    this.setup = setup;
  }

  getTemplateEl() {
    return createTemplateElement(this.templateOption);
  }

  private getClass() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const component = this;
    return class extends HTMLElement {
      constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'closed' });
        component.getTemplateEl()
          .then((template: HTMLTemplateElement) => {
            shadow.append(template.content.cloneNode(true));
            const root = shadow.firstElementChild as HTMLElement;
            const context = component.setup();
            autoComputeAllDerivedVars(context);
            component.callback(root, context);
          });
      }
    };
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
  setup: ComponentSetupFunction<T> = () => ({} as Variables<T>)
) => new Component<T>(template, setup);
