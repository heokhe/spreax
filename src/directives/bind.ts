import { StateVariable } from '../core/state';
import { DirectiveHandler, DirectiveMatch } from './index';

export class BindHandler<T> extends DirectiveHandler<T, HTMLInputElement> {
  name = 'bind';

  parameters = false;

  get isNumericInput() {
    return this.el.type === 'number';
  }

  handleInput(varName: string) {
    const { context, el } = this.target,
      variable = context[varName as keyof T];
    if (variable instanceof StateVariable) {
      const value = this.isNumericInput ? el.valueAsNumber : el.value;
      variable.set(value);
    }
  }

  init(_: never, { parsed }: DirectiveMatch) {
    const input = this.el;
    input.addEventListener('change', () => this.handleInput(parsed.varName));
    input.addEventListener('keydown', () =>
      setTimeout(() => this.handleInput(parsed.varName), 0));
  }

  handle(value: any) {
    this.el.value = String(value);
  }
}
