import { DirectiveHandler } from './index';

export class IfHandler<T> extends DirectiveHandler<T> {
  name = 'if'
  comment = new Comment();
  init() {
    this.el.before(this.comment);
  }
  handle(value: any) {
    const { el } = this;
    return value ? this.comment.after(el) : el.remove();
  }
}
