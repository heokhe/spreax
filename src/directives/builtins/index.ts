import { register } from '..';
import ifDirective from './if';
import on from './on';
import bind from './bind';
import attr from './attr';
import style from './style';
import html from './html';
import classDirective from './class';

register(ifDirective);
register(on);
register(bind);
register(attr);
register(style);
register(html);
register(classDirective);
