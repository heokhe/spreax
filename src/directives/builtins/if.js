import { Directive } from '..';

export default new Directive('if', (({ element, data, context: ctx }) => {
  const parent = element.parentElement,
    comment = document.createComment(element.tagName.toLowerCase());

  element.before(comment);
  ctx.$on(data.property, () => {
    if (data.fn(ctx)) {
      if (!parent.contains(element)) {
        comment.after(element);
      }
    } else element.remove();
  }, true);
}), {
  disallow: ['statement', 'loop']
});
