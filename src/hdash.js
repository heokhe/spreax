import error from './error'
import { exec as execDirective } from './directives/'

export default class Hdash {
	constructor(el, options) {
		if (typeof el === 'string') {
			this.el = document.querySelector(el)
		} else if (el instanceof HTMLElement) {
			this.el = el
		} else {
			error(`wrong selector or element: expected element or string, got ${String(el)}`)
		}
		this.state = options.state || {}
		this.actions = options.actions || {}
		this.watchers = options.watchers || {}
		this.$_events = {}
		this.$_init()
	}
	$_initProxy() {
		this.state = new Proxy(this.state, {
			get: (obj, key) => {
				if (key in obj) return obj[key]
				else error(`unknown state property "${key}"`)
			},
			set: (obj, key, value) => {
				if (!(key in obj)) error(`unknown state property "${key}"`)
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
		Object.keys(this.actions).forEach(k => {
			this.actions[k] = this.actions[k].bind(this)
		})
		Object.keys(this.watchers).forEach(k => {
			this.$_onChange(k, this.watchers[k].bind(this))
		})
		this.$_initProxy()
		this.el.querySelectorAll('*').forEach(this.$_execDirectives.bind(this))
		this.$_observe()
	}
	/**
	 * @param {Element} el 
	 */
	$_execDirectives(el){
		Array.from(el.attributes)
			.map(e => e.name)
			.filter(e => /^h-/.test(e))
			.forEach(dir => {
				execDirective(dir.replace(/^h-/, ''), this, el)
			})
	}
	$_observe(){
		const m = new MutationObserver(muts => {
			muts.forEach(mut => {
				const added = Array.from(mut.addedNodes).filter(e => e.nodeName !== '#text')
				added.forEach(this.$_execDirectives.bind(this))
			})
		})

		m.observe(this.el, {
			childList: true
		})
	}
}