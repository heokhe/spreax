import { Directive } from '..';

export default new Directive('on', function ({
  element, param, data, options: { prevent }
}) {
  element.addEventListener(param, event => {
    if (prevent) event.preventDefault();

    if (data.type === 'action' || data.type === 'statement') {
      data.fn(this.$ctx);
    }
  });
}, {
  paramRequired: true,
  allowStatements: true
});
