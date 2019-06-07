import { Directive } from '..';

export default new Directive('bind', (({
  element, data, options: { trim, lazy }, context: ctx
}) => {
  if (data.type !== 'property' || !data.isPropertyName) return;

  const isNumber = element.type === 'number',
    isCheckbox = element.type === 'checkbox';

  ctx.$on(data.property, () => {
    const val = data.fn(ctx);

    if (isCheckbox) {
      element.checked = !!val;
    } else {
      element.value = val;
    }
  }, true);

  const handleChange = () => {
    let val = isCheckbox ? element.checked : element.value;
    if (!isCheckbox && trim && typeof val === 'string') {
      val = val.trim();
    }

    ctx.$set(data.property, isNumber ? +val : val);
  };

  element.addEventListener('change', handleChange);
  if (!lazy && !isCheckbox) {
    element.addEventListener('keydown', () => {
      setTimeout(handleChange, 0);
    });
  }
}));
