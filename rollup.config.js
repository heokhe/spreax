import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import cleanup from 'rollup-plugin-cleanup';
import { terser } from 'rollup-plugin-terser';
import { main, module as _module, browser } from './package.json';

const input = 'src/index.js',
  createOutput = (format, file, shouldCleanup, comments = 'none') => ({
    input,
    output: {
      strict: false,
      file,
      format,
      name: 'sp',
      exports: 'named'
    },
    plugins: [
      resolve(),
      commonjs(),
      buble({
        objectAssign: 'Object.assign',
        transforms: {
          dangerousForOf: true
        }
      }),
      shouldCleanup ? cleanup({
        comments,
        normalizeEols: 'unix'
      }) : terser()
    ]
  });

export default [
  createOutput('iife', browser, true),
  ...process.env.NODE_ENV === 'production' ? [
    createOutput('iife', browser.replace(/\.js/, '.min.js'), false),
    createOutput('cjs', main, true, 'jsdoc'),
    createOutput('es', _module, true, 'jsdoc')
  ] : []
];
