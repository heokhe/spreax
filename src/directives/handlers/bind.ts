import { DirectiveHandler, DirectiveMatch } from '../index';

export class BindHandler<T> extends DirectiveHandler<T, HTMLInputElement> {
  name = 'bind';

  match: DirectiveMatch;

  parameters = false;

  get isNumericInput() {
    const { type } = this.el;
    return type === 'number' || type === 'range';
  }

  get isCheckbox() {
    return this.el.type === 'checkbox';
  }

  handleInput() {
    const { el } = this,
      value = this.isNumericInput
        ? el.valueAsNumber
        : this.isCheckbox
          ? el.checked
          : el.value;
    this.set(this.match.parsed, value as unknown as T[keyof T]);
  }

  init(_: never, match: DirectiveMatch) {
    this.match = match;
    const { el: input } = this;
    input.addEventListener('change', () => this.handleInput());
    if (!this.isCheckbox)
      input.addEventListener('keydown', () =>
        requestAnimationFrame(() => this.handleInput()));
  }

  handle(value: any) {
    if (this.isCheckbox)
      this.el.checked = !!value;
    else
      this.el.value = String(value);
  }
}
