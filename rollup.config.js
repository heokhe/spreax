import buble from 'rollup-plugin-buble'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import cleanup from 'rollup-plugin-cleanup'
import { terser } from 'rollup-plugin-terser'
import { main, module as _module, browser } from './package.json'
const plugins = [
	resolve(),
	commonjs(),
	buble({
		objectAssign: 'Object.assign',
		transforms: {
			dangerousForOf: true
		}
	}),
	cleanup({
		comments: 'none',
		normalizeEols: 'unix'
	})
]

export default [
	{
		input: 'src/index.js',
		output: {
			file: main,
			format: 'cjs',
		},
		plugins
	},
	{
		input: 'src/index.js',
		output: {
			file: _module,
			format: 'es',
		},
		plugins
	},
	{
		input: 'src/index.js',
		output: {
			file: browser,
			format: 'iife',
			name: 'Spreax'
		},
		plugins
	},
	{
		input: 'src/index.js',
		output: {
			file: browser.replace(/\.js/, '.min.js'),
			format: 'iife',
			name: 'Spreax'
		},
		plugins: [...plugins.slice(0, -1), terser()]
	},
]