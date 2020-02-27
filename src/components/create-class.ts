import { Component } from './component';
import { Prop } from './prop';
import { getPropsFromContext } from './get-props-from-context';
import { autoComputeAllDerivedVars } from '../core/variables';

export function createClass<T>(component: Component<T>) {
  return class extends HTMLElement {
    props: Prop<T[keyof T]>[];

    constructor() {
      super();
      const context = component.setup({
        dispatch: this.dispatch.bind(this)
      });
      this.props = getPropsFromContext(context);

      const shadow = this.attachShadow({ mode: 'open' });
      component.getTemplateEl()
        .then((template: HTMLTemplateElement) => {
          if (this.isConnected) {
            shadow.append(template.content.cloneNode(true));
            const root = [...shadow.children].find(({ tagName }) => tagName !== 'STYLE') as HTMLElement;
            autoComputeAllDerivedVars(context);
            for (const p of component.observedAttributes) {
              this.setProp(p as string);
            }
            component.callback(root, context);
          }
        });
    }

    setProp(name: string) {
      const prop = this.props.find(p => p.name === name);
      if (prop) {
        prop.setFromAttribute(this);
      }
    }

    attributeChangedCallback(name: string) {
      if (this.isConnected)
        this.setProp(name);
    }

    dispatch(type: string, details: any) {
      this.dispatchEvent(new CustomEvent(type, {
        detail: details,
        bubbles: false
      }));
    }

    static get observedAttributes() {
      return component.observedAttributes;
    }
  };
}
