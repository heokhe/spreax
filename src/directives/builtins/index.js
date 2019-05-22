import { register, Directive } from '..';
import on from './on';
import bind from './bind';

register(on);
register(bind);

register(new Directive('if', function ({ element, value }) {
  const parent = element.parentElement;
  const comment = document.createComment(element.tagName.toLowerCase() + +new Date());
  element.before(comment);
  this.$on('*', () => {
    if (value.fn(this)) {
      if (!parent.contains(element)) {
        comment.after(element);
      }
    } else {
      element.remove();
    }
  }, { immediate: true });
}));

register(new Directive('attr', function ({ element, value, param }) {
  this.$on('*', () => {
    element.setAttribute(param, value.fn(this));
  }, { immediate: true });
}));
