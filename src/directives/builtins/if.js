import { Directive } from '..';

export default new Directive('if', function ({ element, value }) {
  const parent = element.parentElement,
    comment = document.createComment('');

  element.before(comment);
  this.$on(value.property || '*', () => {
    if (value.fn(this)) {
      if (!parent.contains(element)) {
        comment.after(element);
      }
    } else {
      element.remove();
    }
  }, { immediate: true });
});
