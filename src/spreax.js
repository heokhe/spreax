import makeFormatterFn from './makeFormatterFn'
import interpolation from './interpolation'
import getTextNodes from './dom/getTextNodes'
import makeObserver from './makeObserver'
import execDirectives from './execDirectives'

export default class Spreax {
	constructor(el, options) {
		if (typeof el === 'string') this.$el = document.querySelector(el)
		else if (el instanceof HTMLElement) this.$el = el
		else {
			throw new TypeError(`wrong selector or element: expected element or string, got "${String(el)}"`)
		}

		this.$events = []
		/** @type {Object<string, (args: any) => any>} */
		this.$formatters = {}
		this.$_proxy = null
		this.$extendWith(
			options.state || {},
			options.actions || {},
			options.computed || {},
			options.formatters || {}
		)
		getTextNodes(this.$el).forEach(this.$interpolation, this)
		this.$el.querySelectorAll('*').forEach(this.$execDirectives, this)
		this.$observe()
	}

	$extendWith(state, actions, computed, formatters, /* watchers */) {
		this.$makeProxy(state)

		for (const p in state) {
			Object.defineProperty(this, p, {
				get: () => this.$_proxy[p],
				set: nv => { this.$_proxy[p] = nv }
			})
		}
		for (const a in actions) this[a] = actions[a].bind(this)
		for (const c in computed) {
			Object.defineProperty(this, c, {
				get: computed[c].bind(this),
				set: () => false
			})
		}
		for (const f in formatters) this.$formatters[f] = formatters[f].bind(this)
		// for (const w in watchers) this.$on(w, watchers[w].bind(this), { type: 'w' })
	}

	$makeProxy(o) {
		this.$_proxy = new Proxy(o, {
			get: (obj, key) => {
				if (!obj.hasOwnProperty(key)) throw new Error(`unknown state property "${key}"`)
				return obj[key]
			},
			set: (obj, key, value) => {
				if (!obj.hasOwnProperty(key)) throw new Error(`unknown state property "${key}"`)
				if (value === obj[key]) return
				obj[key] = value
				this.$emit(key)
				this.$emit()
				return true
			},
			deleteProperty: () => false
		})
	}

	$pipeFormatters(formatters) {
		return makeFormatterFn(formatters, this.$formatters).bind(this)
	}

	/**
	 * @param {Element} el 
	 */
	$execDirectives(el) {
		execDirectives(el, (callback, args) => {
			if (typeof callback === 'function') callback.call(this, args)
			else {
				if ('ready' in callback) callback.ready.call(this, args)
				if ('updated' in callback) {
					this.$on('', () => {
						callback.updated.call(this, args)
					}, { type: 'd', node: el })
				}
			}
		})
	}

	$interpolation(node) {
		interpolation(node, ({ initialText: itext, node, propertyName, formatters, match: { startIndex, string } }) => {
			const formatterFn = this.$pipeFormatters(formatters)

			this.$on(propertyName, v => {
				v = String(formatterFn(v))

				const beforeValue = itext.slice(0, startIndex),
					afterValue = itext.slice(startIndex + string.length + v.length, itext.length),
					newText = beforeValue + v + afterValue

				if (itext !== newText) node.textContent = newText
			}, {
					immediate: true,
					type: 'i',
					node
				})
		})
	}

	$observe() {
		const removeNodeFromEvents = (node, type = 'i') => {
			const events = this.$events.filter(e => e.type === type && e.node === node).map((_, i) => i)
			for (const e of events) this.$events.splice(e, 1)
		}

		makeObserver({
			textAdded: this.$interpolation.bind(this),
			elementAdded: this.$execDirectives.bind(this),
			textRemoved: removeNodeFromEvents,
			elementRemoved: n => { removeNodeFromEvents(n, 'd') }
		}).observe(this.$el, {
			childList: true,
			subtree: true
		})
	}

	$on(prop, fn, { type, node, immediate = false }) {
		this.$events.push({
			prop, fn,
			...type ? { type } : {},
			...node ? { node } : {},
		})
		if (immediate) this.$emit(prop)
	}

	$emit(prop) {
		this.$events.filter(ev => {
			return prop ? ev.prop === prop : true
		}).forEach(ev => {
			const args = ev.prop ? [this[ev.prop]] : []
			ev.fn.apply(this, args)
		})
	}
}