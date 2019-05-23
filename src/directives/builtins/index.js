import { register } from '..';
import ifDirective from './if';
import on from './on';
import bind from './bind';
import attr from './attr';

register(ifDirective);
register(on);
register(bind);
register(attr);
