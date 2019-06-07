import { Directive } from '..';

export default new Directive('bind', (({
  element, data, options: { trim, lazy }, context: ctx
}) => {
  if (!data.isPropertyName) return;

  const { type } = element,
    isNumberic = ['number', 'range'].includes(type),
    isCheckbox = type === 'checkbox';

  ctx.$on(data.property, () => {
    const val = data.fn(ctx);
    if (isCheckbox) element.checked = !!val;
    else element.value = val;
  }, true);

  const handleChange = () => {
    let val = isCheckbox ? element.checked
      : isNumberic ? element.valueAsNumber
        : element.value;
    if (trim && typeof val === 'string') val = val.trim();

    ctx.$set(data.property, val);
  };

  element.addEventListener('change', handleChange);
  if (!lazy) element.addEventListener('input', handleChange);
}), {
  allow: ['property']
});
