import { Directive } from '..';

export default new Directive('attr', function ({ element, data, param }) {
  this.$on(data.property, () => {
    const val = data.fn(this);
    if (val === false) element.removeAttribute(param);
    else element.setAttribute(param, val);
  }, { immediate: true });
}, {
  paramRequired: true
});
