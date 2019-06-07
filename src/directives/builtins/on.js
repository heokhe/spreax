import { Directive } from '..';

export default new Directive('on', ({
  element, param, data, options: { prevent }, context: ctx
}) => {
  element.addEventListener(param, event => {
    if (prevent) event.preventDefault();

    if (data.type === 'method' || data.type === 'statement') {
      data.fn(ctx);
    } else throw new Error(`expected method or statement, got ${data.type}`);
  });
}, {
  paramRequired: true,
  allowStatements: true
});
