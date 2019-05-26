import { Directive } from '..';

export default new Directive('style', function ({ element, param, value }) {
  if (value.type === 'statement') return;
  this.$on(value.property || '*', () => {
    let val = value.fn(this);
    if (typeof val === 'number') val += 'px';
    element.style[param] = val;
  }, { immediate: true });
}, true);
