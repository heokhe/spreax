import buble from 'rollup-plugin-buble';
import resolve from 'rollup-plugin-node-resolve';
import cleanup from 'rollup-plugin-cleanup';
import { terser } from 'rollup-plugin-terser';
import { main, module as _module, browser } from './package.json';

const input = 'src/index.js',
  createOutput = (format, file, plugins) => ({
    input,
    output: {
      strict: false,
      file,
      format,
      name: 'sp',
      exports: 'named'
    },
    plugins
  });

const browserBuble = buble({
  objectAssign: 'Object.assign',
  transforms: {
    dangerousForOf: true
  }
});

export default [
  createOutput('iife', browser, [
    resolve(),
    browserBuble,
    cleanup({ comments: 'none' })
  ]),
  ...process.env.NODE_ENV === 'production' ? [
    createOutput('iife', browser.replace(/\.js/, '.min.js'), [
      resolve(),
      browserBuble,
      terser()
    ]),
    createOutput('cjs', main, [resolve()]),
    createOutput('es', _module, [resolve()])
  ] : []
];
