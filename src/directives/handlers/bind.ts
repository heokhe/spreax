import { DirectiveHandler, DirectiveMatch } from '../index';

export class BindHandler<T> extends DirectiveHandler<T, HTMLInputElement> {
  name = 'bind';

  match: DirectiveMatch;

  parameters = false;

  get isNumericInput() {
    return this.el.type === 'number';
  }

  handleInput() {
    const { el } = this,
      value = this.isNumericInput ? el.valueAsNumber : el.value;
    this.set(this.match.parsed, value as unknown as T[keyof T]);
  }

  init(_: never, match: DirectiveMatch) {
    this.match = match;
    const { el: input } = this;
    input.addEventListener('change', () => this.handleInput());
    input.addEventListener('keydown', () =>
      setTimeout(() => this.handleInput(), 0));
  }

  handle(value: any) {
    this.el.value = String(value);
  }
}
