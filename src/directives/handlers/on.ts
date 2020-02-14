import { DirectiveHandler, DirectiveMatch } from '../handler';
import { ActionFn } from '../../core/actions';

type FnAndArg = {
  fn: ActionFn;
  arg?: any;
}
type Fns = {
  [x: string]: FnAndArg;
};

export class OnHandler<T> extends DirectiveHandler<T> {
  name = 'on';

  parameters = true;

  preserveFunctionsWhenEvaluating = true;

  fns: Fns = {};

  private addOrUpdateFunction(fnAndArg: any, eventName: string) {
    const { fn, arg = undefined } = fnAndArg ?? {};
    if (typeof fn === 'function') {
      this.fns[eventName] = {
        fn: fn as ActionFn,
        arg
      };
    }
  }

  init(value: any, { parameter: eventName }: DirectiveMatch) {
    this.addOrUpdateFunction(value, eventName);
    this.el.addEventListener(eventName, event => {
      const { fn, arg } = this.fns[eventName] || {};
      fn?.(arg, event);
    });
  }

  handle(value: any, { parameter: eventName }: DirectiveMatch) {
    this.addOrUpdateFunction(value, eventName);
  }
}
