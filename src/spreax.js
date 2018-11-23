import getTextNodes from './dom/getTextNodes'
import execDirectives from './execDirectives'
import makeFormatterFn from './makeFormatterFn'
import createObserver from './createObserver'
import makeProxy from './proxy'
import extend from './extend'

export default class Spreax {
	constructor(el, options) {
		if (typeof el === 'string') this.$el = document.querySelector(el)
		else if (el instanceof HTMLElement) this.$el = el
		else throw new TypeError(`wrong selector or element: expected element or string, got "${String(el)}"`)
		/** @type {{fn: (arg: *) => void, id: string, prop: string, ownerNode?: Node|Element}[]} */
		this.$events = []
		this.$formatters = {}
		this.$makeProxy(options.state)
		extend(this, {
			state: options.state, actions: options.actions,
			computed: options.computed, formatters: options.formatters
		})
		getTextNodes(this.$el).forEach(this.$processTemplate, this)
		this.$el.querySelectorAll('*').forEach(this.$execDirectives, this)
		this.$observe()
		this.$diffProp = null
		this.$diffPropValue = undefined
	}
	
	$makeProxy(o = {}) {
		this.$proxy = makeProxy(o, {
			beforeSet: (obj, key) => {
				this.$diffProp = key
				this.$diffPropValue = obj[key]
			},
			setted: () => this.$update()
		})
	}

	$pipeFormatters(formatters) {
		return makeFormatterFn(formatters, this.$formatters).bind(this)
	}

	/** @param {Element} el */
	$execDirectives(el) {
		execDirectives(el, (callback, args) => {
			if (typeof callback === 'function') callback.call(this, args)
			else {
				if ('ready' in callback) callback.ready.call(this, args)
				if ('updated' in callback) this.$onUpdate(() => {
					callback.updated.call(this, args)
				}, { ownerNode: el })
			}
		})
	}

    /** @param {Node} node */
	$processTemplate(node) {
		const RE = /#\[\w+(?: \w+)*\]/g,
		rawText = node.textContent
		if (!RE.test(rawText)) return
		const replaceByObject = obj => {
			return rawText.replace(RE, $1 => {
				const [prop, ...formatters] = $1.slice(2, -1).split(' ')
				return this.$pipeFormatters(formatters)(obj[prop])
			})
		}
		this.$onUpdate(() => {
			const oldText = replaceByObject({
				...this.$proxy,
				[this.$diffProp]: this.$diffPropValue
			}),
			newText = replaceByObject(this),
			shouldReplace = !this.$diffProp ? true : (oldText !== newText)
			if (shouldReplace) node.textContent = newText
		}, {
			immediate: true,
			ownerNode: node
		})
	}

	$observe() {
		const removeNodeFromEvents = ownerNode => {
			const events = this.$events.filter(e => e.ownerNode === ownerNode).map((_, i) => i)
			for (const e of events) this.$events.splice(e, 1)
		}
		createObserver({
			textAdded: this.$processTemplate.bind(this),
			elementAdded: this.$execDirectives.bind(this),
			textRemoved: removeNodeFromEvents,
			elementRemoved: removeNodeFromEvents
		}).observe(this.$el, { childList: true, subtree: true })
	}

	$onUpdate(fn, { prop = '', ownerNode, immediate = false }) {
		const id = (Math.random() * 1e6 >> 0).toString().padEnd(6, '0')
		this.$events.push({
			prop, fn, id,
			...ownerNode ? { ownerNode } : {}
		})
		if (immediate) this.$update(id)
	}

	$update(id) {
		this.$events.filter(ev => {
			if (id) return ev.id === id
			return ev.prop ? ev.prop === this.$diffProp : true
		}).forEach(({prop, fn}) => {
			fn.call(this, this[prop])
		})
	}
}