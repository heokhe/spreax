import { register, Directive } from '..';
import ifDirective from './if';
import on from './on';
import bind from './bind';

register(ifDirective);
register(on);
register(bind);

register(new Directive('attr', function ({ element, value, param }) {
  this.$on('*', () => {
    element.setAttribute(param, value.fn(this));
  }, { immediate: true });
}));
