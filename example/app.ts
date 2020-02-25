import Spreax from '../src/index';
import MyCounter from './my-counter';
import MyParagraph from './my-paragraph';

const app = new Spreax(
  '#app',
  {},
  {
    'my-paragraph': MyParagraph,
    'my-counter': MyCounter
  }
);

globalThis.app = app;
