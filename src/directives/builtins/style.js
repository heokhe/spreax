import { Directive } from '..';

export default new Directive('style', function ({ element, param, data }) {
  this.$on(data.property, () => {
    let val = data.fn(this.$ctx);
    if (typeof val === 'number') val += 'px';
    element.style[param] = val;
  }, { immediate: true });
}, {
  paramRequired: true
});
