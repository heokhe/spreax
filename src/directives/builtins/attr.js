import { Directive } from '..';

export default new Directive('attr', (({
  element, data, param, context: ctx
}) => {
  ctx.$on(data.property, () => {
    const val = data.fn(ctx);
    if (val === false) element.removeAttribute(param);
    else element.setAttribute(param, val);
  }, true);
}), {
  paramRequired: true
});
