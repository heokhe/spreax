import { Directive } from '..';

export default new Directive('if', function ({ element, data }) {
  const parent = element.parentElement,
    comment = document.createComment(element.tagName.toLowerCase());

  element.before(comment);
  this.$on(data.property, () => {
    if (data.fn(this.$ctx)) {
      if (!parent.contains(element)) {
        comment.after(element);
      }
    } else {
      element.remove();
    }
  }, { immediate: true });
});
