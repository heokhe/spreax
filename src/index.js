import error from './error'
import * as drctv from './directives/index'

export default class Ryo {
	constructor(el, options) {
		if (typeof el === 'string') {
			this.el = document.querySelector(el)
		} else if (el instanceof HTMLElement) {
			this.el = el
		} else {
			error('wrong selector or element: expected element or string')
		}
		this.state = options.state || {}
		this.actions = options.actions || {}
		Object.keys(this.actions).forEach(k => {
			this.actions[k] = this.actions[k].bind(this)
		})
		this.$_events = {}
		this.$_init()
	}
	$_initStateProxy() {
		this.state = new Proxy(this.state, {
			get: (obj, key) => {
				if (key in obj) return obj[key]
				else error(`property ${key} does'nt exist in state.`)
			},
			set: (obj, key, value) => {
				if (!(key in obj)) error(`property "${key}" does'nt exist in state.`)
				obj[key] = value
				this.$_emit(key)
				return true
			}
		})
	}
	$_emit(name) {
		if (!(name in this.$_events)) this.$_events[name] = []
		this.$_events[name].forEach(e => {
			e(this.state[name])
		})
	}
	$_onChange(name, fn, immediate) {
		let evs = this.$_events[name]
		if (typeof evs === 'undefined') evs = []
		evs.push(fn)

		this.$_events[name] = evs
		if (immediate) {
			this.$_emit(name)
		}
	}
	$_init() {
		this.$_initStateProxy()
		this.el.querySelectorAll('*').forEach(el => {
			Array.from(el.attributes)
				.map(e => e.name)
				.filter(e => /^r-/.test(e))
				.forEach(dir => {
					drctv.exec(dir.replace(/^r-/, ''), this, el)
				})
		})
	}
}