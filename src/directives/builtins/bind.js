import { Directive } from '..';
import { setDeep } from '../../utils';

export default new Directive('bind', function ({ element, value, options: { trim } }) {
  if (value.type !== 'property') return;

  const isNumber = element.type === 'number',
    isCheckbox = element.type === 'checkbox';

  this.$on(value.property, () => {
    const val = value.fn(this);

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
    setDeep(this, value.path, isNumber ? +val : val);
  };

  element.addEventListener('change', handleChange);
  if (!isCheckbox) {
    element.addEventListener('keydown', () => {
      setTimeout(handleChange, 0);
    });
  }
});
