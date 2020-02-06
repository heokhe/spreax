import ts from '@wessberg/rollup-plugin-ts';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import { main, module as _module, browser } from '../package.json';

const createOutput = (format, file, plugins, declaration = false) => ({
  input: 'src/index.ts',
  output: {
    strict: false,
    file,
    format,
    name: 'sp',
    exports: 'named'
  },
  plugins: [
    ts({
      browserslist: false,
      tsconfig: {
        target: 'ES6',
        declaration,
        declarationDir: 'typings',
        preserveConstEnums: false
      }
    }),
    resolve({
      extensions: ['.ts', '.js']
    }),
    ...plugins
  ]
});

export default [
  createOutput('iife', browser, []),
  createOutput('iife', browser.replace(/\.js/, '.min.js'), [terser()]),
  createOutput('cjs', main, []),
  createOutput('es', _module, [], true)
];
