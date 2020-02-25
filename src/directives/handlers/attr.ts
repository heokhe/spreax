import { DirectiveHandler } from '../handler';
import { DirectiveMatch } from '../matches';
import { isComponent, setSecretAttribute } from '../../dom';

export class AttrHandler<T> extends DirectiveHandler<T> {
  name = 'attr';

  parameters = true;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  init() {}

  handleBooleanValue(value: boolean, attrName: string) {
    const { el } = this;
    if (value) el.setAttribute(attrName, '');
    else el.removeAttribute(attrName);
  }

  handle(value: any, { parameter: attrName }: DirectiveMatch) {
    if (isComponent(this.el))
      setSecretAttribute(this.el, attrName, typeof value === 'string' ? `"${value}"` : value);
    if (typeof value === 'boolean') {
      this.handleBooleanValue(value, attrName);
    } else {
      this.el.setAttribute(attrName, String(value));
    }
  }
}
