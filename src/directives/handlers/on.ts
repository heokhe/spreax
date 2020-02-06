import { DirectiveHandler, DirectiveMatch } from '../handler';
import { ActionFn } from '../../core/actions';

export class OnHandler<T> extends DirectiveHandler<T> {
  name = 'on';

  parameters = true;

  fn: ActionFn;

  arg?: any;

  init(value: any, match: DirectiveMatch) {
    const { fn, arg = undefined } = value ?? {};
    if (typeof fn === 'function') {
      this.fn = fn as ActionFn;
      this.arg = arg;
    }

    this.el.addEventListener(match.parameter, event => {
      this.fn?.(this.arg, event);
    });
  }

  handle(value: any) {
    const { fn, arg = undefined } = value ?? {};
    if (typeof fn === 'function') {
      this.fn = fn as ActionFn;
      this.arg = arg;
    }
  }
}
