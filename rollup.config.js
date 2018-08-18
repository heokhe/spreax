const buble = require('rollup-plugin-buble')({
	objectAssign: 'Object.assign'
})
const {uglify} = require('rollup-plugin-uglify')
const commonjs = require('rollup-plugin-commonjs')
const node = require('rollup-plugin-node-resolve')
const cleanupPlugin = require('rollup-plugin-cleanup')
const pkg = require('./package.json')
const cleanup = cleanupPlugin({
	comments: 'none',
	normalizeEols: 'unix'
})

module.exports = [
	{
		input: 'src/index.js',
		output: {
			file: pkg.main,
			format: 'cjs',
		},
		plugins: [
			node(),
			commonjs(),
			buble,
			cleanup
		]
	},
	{
		input: 'src/index.js',
		output: {
			file: pkg.main.replace(/\.js/, '.min.js'),
			format: 'cjs',
		},
		plugins: [
			node(),
			commonjs(),
			buble,
			uglify()
		]
	},
	{
		input: 'src/index.js',
		output: {
			file: pkg.browser,
			format: 'iife',
			name: 'Hdash'
		},
		plugins: [
			node(),
			commonjs(),
			buble,
			cleanup
		]
	},
	{
		input: 'src/index.js',
		output: {
			file: pkg.browser.replace(/\.js/, '.min.js'),
			format: 'iife',
			name: 'Hdash'
		},
		plugins: [
			node(),
			commonjs(),
			buble,
			uglify()
		]
	},
]