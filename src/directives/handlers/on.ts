import { DirectiveHandler } from '../handler';
import { DirectiveMatch } from '../matches';
import { ActionFn } from '../../core/actions';

type FnAndArg = {
  fn: ActionFn;
  args: any[];
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
    const { fn, args } = fnAndArg ?? {};
    if (typeof fn === 'function') {
      this.fns[eventName] = {
        fn: fn as ActionFn,
        args
      };
    }
  }

  init(value: any, { parameter: eventName }: DirectiveMatch) {
    this.addOrUpdateFunction(value, eventName);
    this.el.addEventListener(eventName, event => {
      const { fn, args } = this.fns[eventName] || {};
      fn?.(event, ...args);
    });
  }

  handle(value: any, { parameter: eventName }: DirectiveMatch) {
    this.addOrUpdateFunction(value, eventName);
  }
}
