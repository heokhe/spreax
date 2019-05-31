import { Directive } from '..';
import { setDeep } from '../../utils';

export default new Directive('bind', function ({ element, data, options: { trim } }) {
  if (data.type !== 'property' || !data.isPropertyName) return;

  const isNumber = element.type === 'number',
    isCheckbox = element.type === 'checkbox';

  this.$on(data.property, () => {
    const val = data.fn(this.$ctx);

    if (isCheckbox) {
      element.checked = !!val;
    } else {
      element.value = val;
    }
  }, { immediate: true });

  const handleChange = () => {
    let val = isCheckbox ? element.checked : element.value;
    if (!isCheckbox && trim && typeof val === 'string') {
      val = val.trim();
    }
    setDeep(this, data.path, isNumber ? +val : val);
  };

  element.addEventListener('change', handleChange);
  if (!isCheckbox) {
    element.addEventListener('keydown', () => {
      setTimeout(handleChange, 0);
    });
  }
});
