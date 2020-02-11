import ts from '@wessberg/rollup-plugin-ts';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import {
  main as cjs, module as esm, browser, unpkg
} from '../package.json';

const createOutput = (format, file, minify, declaration = false) => ({
  input: 'src/index.ts',
  output: {
    strict: false,
    file,
    format,
    name: 'spreax',
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
    ...minify ? [terser()] : []
  ]
});

export default [
  createOutput('iife', browser, true),
  createOutput('cjs', cjs, false),
  createOutput('es', unpkg, true, false),
  createOutput('es', esm, false, true)
];
