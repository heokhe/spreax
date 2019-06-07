import { Directive } from '..';

export default new Directive('on', ({
  element, param, data, options: { prevent }, context: ctx
}) => {
  element.addEventListener(param, event => {
    if (prevent) event.preventDefault();

    if (data.type === 'action' || data.type === 'statement') {
      data.fn(ctx);
    }
  });
}, {
  paramRequired: true,
  allowStatements: true
});
