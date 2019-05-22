import { Directive } from '..';
import { setDeep } from '../../utils';

export default new Directive('bind', function ({ element, rawValue, value }) {
  if (value.type !== 'property' || rawValue !== value.property) return;

  const isNumber = element.type === 'number';

  this.$on(value.property, () => {
    element.value = value.fn(this);
  }, { immediate: true });

  const handleChange = () => {
    setTimeout(() => {
      const val = element.value;
      setDeep(this, value.path, isNumber ? +val : val);
    }, 0);
  };

  element.addEventListener('keydown', handleChange);
});
