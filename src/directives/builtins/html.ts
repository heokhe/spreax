import { Directive } from '..';

export default new Directive('html', ({ data, context: ctx, element: el }) => {
  ctx.$on(data.property, () => {
    el.innerHTML = data.fn(ctx);
  }, true);
}, {
  disallow: ['loop', 'statement']
});
