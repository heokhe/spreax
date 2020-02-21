import { DirectiveHandler } from '../handler';

export class HtmlHandler<T> extends DirectiveHandler<T> {
  name = 'html';

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  init() {}

  handle(value: any) {
    this.el.innerHTML = String(value);
  }
}
