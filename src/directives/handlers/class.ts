import { DirectiveHandler } from '../handler';
import { DirectiveMatch } from '../matches';

export class ClassHandler<T> extends DirectiveHandler<T> {
  name = 'class';

  parameters = true;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  init() {}

  handle(value: any, { parameter: className }: DirectiveMatch) {
    const { classList } = this.el;
    if (value)
      classList.add(className);
    else
      classList.remove(className);
  }
}
