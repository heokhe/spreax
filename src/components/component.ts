import { Variables, autoComputeAllDerivedVars } from '../core/variables';
import { createTemplateElement } from './create-template';
import { getPropsFromContext } from './get-props-from-context';
import { Prop } from './prop';

export type ComponentTemplate = HTMLTemplateElement | string | Promise<string>;
export type ComponentSetupFunction<T> = () => Variables<T>;
export type ComponentCallback<T> = (root: HTMLElement, context: Variables<T>) => void

export class Component<T> {
  name: string;

  private templateOption: ComponentTemplate;

  callback: ComponentCallback<T>;

  setup: ComponentSetupFunction<T>;

  observedAttributes: (keyof T)[];

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
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const component = this;
    return class extends HTMLElement {
      props: Prop<T[keyof T]>[];

      constructor() {
        super();
        const context = component.setup();
        this.props = getPropsFromContext(context);

        const shadow = this.attachShadow({ mode: 'closed' });
        component.getTemplateEl()
          .then((template: HTMLTemplateElement) => {
            shadow.append(template.content.cloneNode(true));
            const root = shadow.firstElementChild as HTMLElement;
            autoComputeAllDerivedVars(context);
            for (const p of component.observedAttributes) {
              this.setProp(p as string);
            }
            component.callback(root, context);
          });
      }

      setProp(name: string) {
        const prop = this.props.find(p => p.name === name);
        if (prop) {
          prop.setFromAttribute(this);
        }
      }

      attributeChangedCallback(name: string) {
        this.setProp(name);
      }

      static get observedAttributes() {
        return component.observedAttributes;
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
  setup: ComponentSetupFunction<T> = () => ({} as Variables<T>),
  propNames: (keyof T)[] = []
) => new Component<T>(template, setup, propNames);
