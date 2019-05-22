import { Directive } from '..';

export default new Directive('on', function ({ element, param, value }) {
  element.addEventListener(param, () => {
    if (value.type === 'action') {
      value.fn(this);
    }
  });
}, true);
