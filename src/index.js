import error, { domError } from './error'
import getTextNodes from './dom/getTextNodes'
import arrayUnique from './utils/arrayUnique'
import * as interpolation from './interpolation'
import * as d from './directives/index'
import directivesOf from './dom/directivesOf'

export default class Hdash {
	constructor(el, options) {
		if (!this instanceof Hdash) error('Hdash must be called with new operator')
		if (typeof el === 'string') {
			this.$el = document.querySelector(el)
		} else if (el instanceof HTMLElement) {
			this.$el = el
		} else {
			error(`wrong selector or element: expected element or string, got "${String(el)}"`)
		}
		this.state = options.state || {}
		this.actions = options.actions || {}
		this.$watchers = options.watchers || {}
		this.$formatters = options.formatters || {}
		this.$events = []
		this.$init()
	}

	$init() {
		// bind actions to instance
		Object.keys(this.actions).forEach(k => {
			this.actions[k] = this.actions[k].bind(this)
		})
		// add listeners for watchers
		Object.keys(this.$watchers).forEach(k => {
			this.$on(k, this.$watchers[k])
		})
		// make state proxy
		this.$initProxy()
		// attach directives
		this.$el.querySelectorAll('*').forEach(this.$execDirectives.bind(this))
		// start interpolation functionality
		this.$interpolation()
		// start observer
		this.$observe()
	}

	$initProxy() {
		this.state = new Proxy(this.state, {
			get: (obj, key) => {
				if (key in obj) return obj[key]
				else error(`unknown state property "${key}"`)
			},
			set: (obj, key, value) => {
				if (!key in obj) error(`unknown state property "${key}"`)
				obj[key] = value
				this.$emit(key)
				this.$emit()
				return true
			}
		})
	}

	/**
	 * @param {Element} el 
	 */
	$execDirectives(el) {
		for (const { name, arg, modifiers } of directivesOf(el)) {
			const dir = d.all[name];
			if (dir === undefined) domError(`directive "${name}" not found`, el)

			switch (dir.argState) {
				case 'empty':
					if (!!arg) domError(`directive "${name}" needed no arguments, but there is an argument`, el)
					break
				case 'required':
					if (!arg) domError(`directive needs an arguments, but there's nothing`, el)
					break
			}

			const attrValue = el.getAttribute('h-' + (!!arg ? (name + ':' + arg) : name)),
			argArray = [el, attrValue, modifiers, arg]

			if (typeof dir.callback === 'function') {
				dir.callback.apply(this, argArray)
			} else {
				if ('ready' in dir.callback) dir.callback.ready.apply(this, argArray)
				if ('updated' in dir.callback) {
					this.$on('', () => {
						dir.callback.updated.apply(this, argArray)
					}, {
						type: 'DIRECTIVE'
					})
				}
			}
		}
	}

	$interpolation() {
		getTextNodes(this.$el).forEach(this.$interpolateNode.bind(this))
	}

	/**
	 * @param {Node} node 
	 */
	$interpolateNode(node){
		if (!interpolation.contains(node.textContent)) return;

		let exps = arrayUnique(node.textContent.match(interpolation.global).map(interpolation.trim))
		const initText = node.textContent

		for (const exp of exps) {
			let [prop, ...formatters] = exp.split(' | ')
			const reg = new RegExp('\\{ ' + exp.replace(/\|/g, '\\|') + ' \\}', 'g')
			
			if (formatters.length){
				formatters = formatters.map(e => {
					if (e in this.$formatters) return this.$formatters[e]
					else error(`formatter "${e}" not found`)
				}).reduce((a, b) => {
					return arg => {
						return b(a(arg))
					}
				})
			} else {
				formatters = x => x
			}

			this.$on(prop, v => {
				let replaced = initText.replace(reg, formatters(v))
				if (node.textContent !== replaced) node.textContent = replaced
			}, {
				immediate: true,
				type: 'INTERPOLATION',
				id: node
			})
		}
	}

	$observe(){
		const m = new MutationObserver(muts => {
			muts.forEach(mut => {
				for (const anode of mut.addedNodes) {
					if (anode.nodeType === document.TEXT_NODE) this.$interpolateNode(anode)
				}
				for (const rnode of mut.removedNodes) {
					const removeNodeFromEvents = node => {
						this.$events.filter(e => {
							return e.type === 'INTERPOLATION' && e.id === node
						}).map(e => this.$events.indexOf(e)).forEach(i => {
							this.$events.splice(i, 1)
						})
					}

					if (rnode.nodeType === document.TEXT_NODE) {
						removeNodeFromEvents(rnode)
					} else if (rnode.nodeType === document.ELEMENT_NODE) {
						getTextNodes(rnode).forEach(removeNodeFromEvents)
					}
				}
			})
		})

		m.observe(this.$el, {
			childList: true,
			subtree: true
		})
	}

	$on(key, fn, options) {
		this.$events.push({
			key,
			fn,
			type: options.type,
			id: options.id,
		})
		if (options.immediate) this.$emit(key)
	}
	
	$emit(key) {
		this.$events.filter(ev => {
			return key ? ev.key === key : true
		}).forEach(ev => {
			let args = ev.key ? [this.state[ev.key]] : []
			ev.fn.apply(this, args)
		})
	}
}