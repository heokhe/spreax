// import buble from 'rollup-plugin-buble';
import resolve from '@rollup/plugin-node-resolve';
// import cleanup from 'rollup-plugin-cleanup';
// import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import ts from '@rollup/plugin-typescript';
import { main, module as _module, browser } from './package.json';

const input = 'src/index.ts',
  createOutput = (format, file, plugins) => ({
    input,
    output: {
      strict: false,
      file,
      format,
      name: 'sp',
      exports: 'named'
    },
    plugins: [
      ts(),
      resolve({
        extensions: ['.ts', '.js']
      }),
      ...plugins
    ]
  });

export default process.env.NODE_ENV === 'production' ? [
  createOutput('iife', browser, []),
  createOutput('iife', browser.replace(/\.js/, '.min.js'), [terser()]),
  createOutput('cjs', main, []),
  createOutput('es', _module, [])
] : {
  input: 'example/app.ts',
  output: {
    file: 'example/app.js',
    format: 'iife'
  },
  plugins: [
    ts(),
    resolve({
      extensions: ['.ts', '.js']
    })
  ]
};
