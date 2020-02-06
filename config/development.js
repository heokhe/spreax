import resolve from '@rollup/plugin-node-resolve';
import ts from '@rollup/plugin-typescript';

export default {
  input: 'example/app.ts',
  output: {
    file: 'example/app.js',
    format: 'iife'
  },
  plugins: [
    ts(),
    resolve({
      extensions: ['.ts']
    })
  ]
};
