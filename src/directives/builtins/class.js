import { Directive } from '..';

export default new Directive('class', ({
  data, element, param, context: ctx
}) => {
  ctx.$on(data.property, () => {
    const { classList: list } = element,
      value = data.fn(ctx);

    if (param) {
      if (value) list.add(param);
      else list.remove(param);
    } else if (value !== null && typeof value === 'object') {
      for (const key in value) {
        if (value[key]) list.add(key);
        else list.remove(key);
      }
    } else throw new Error('expected string or object');
  }, true);
});
