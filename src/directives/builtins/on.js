import { Directive } from '..';

export default new Directive('on', ({
  element, param, data, options: { prevent }, context: ctx
}) => {
  element.addEventListener(param, event => {
    if (prevent) event.preventDefault();
    data.fn(ctx);
  });
}, {
  paramRequired: true,
  allow: ['method', 'statement']
});
