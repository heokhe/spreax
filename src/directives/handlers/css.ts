import { DirectiveHandler, DirectiveMatch } from '../handler';

export class CssHandler<T> extends DirectiveHandler<T> {
  name = 'css';

  parameters = true;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  init() {}

  handle(value: any, match: DirectiveMatch) {
    this.el.style[match.parameter] = value;
  }
}
