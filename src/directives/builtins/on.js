import { Directive } from '..';

export default new Directive('on', function ({
  element, param, value, options: { prevent }
}) {
  element.addEventListener(param, event => {
    if (prevent) event.preventDefault();

    if (value.type === 'action') {
      value.fn(this);
    }
  });
}, true);
