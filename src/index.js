import error, { domError } from './error';
import getTextNodes from './dom/getTextNodes';
import arrayUnique from './utils/arrayUnique';
import * as interpolation from './interpolation';
import * as d from './directives/index';
import directivesOf from './dom/directivesOf';
import toString from './directives/toString';
import makeFormatterFn from './makeFormatterFn';

class Hdash {
	constructor(el, options) {
		if (!(this instanceof Hdash)) error('Hdash must be called with new operator');
		if (typeof el === 'string') {
			this.$el = document.querySelector(el);
		} else if (el instanceof HTMLElement) {
			this.$el = el;
		} else {
			error(`wrong selector or element: expected element or string, got "${String(el)}"`);
		}

		this.$events = [];
		this.$formatters = {};
		this.$_proxy = null;
		this.$extendWith(
			options.state || {},
			options.actions || {},
			options.computed || {},
			options.formatters || {}
		);
		this.$interpolation();
		this.$el.querySelectorAll('*').forEach(this.$execDirectives.bind(this));
		this.$observe();
	}

	$extendWith(state, actions, computed, formatters) {
		this.$makeProxy(state);

		Object.keys(state).forEach(p => {
			Object.defineProperty(this, p, {
				get: () => this.$_proxy[p],
				set: nv => {
					this.$_proxy[p] = nv;
				}
			});
		});
		Object.entries(actions).forEach(([name, fn]) => {
			this[name] = fn.bind(this);
		});
		Object.entries(computed).forEach(([name, fn]) => {
			Object.defineProperty(this, name, {
				get: fn.bind(this),
				set: () => false
			});
		});
		Object.entries(formatters).forEach(([name, fn]) => {
			this.$formatters[name] = fn.bind(this);
		});
	}

	$makeProxy(o) {
		this.$_proxy = new Proxy(o, {
			get: (obj, key) => {
				if (!obj.hasOwnProperty(key)) error(`unknown state property "${key}"`);
				return obj[key];
			},
			set: (obj, key, value) => {
				if (!obj.hasOwnProperty(key)) error(`unknown state property "${key}"`);
				obj[key] = value;
				this.$emit(key);
				this.$emit();
				return true;
			},
			deleteProperty: () => false
		});
	}

	$pipeFormatters(formatters) {
		if (arguments.length > 1) formatters = Array.prototype.slice.call(arguments);
		else if (arguments.length === 1 && typeof formatters === 'string') formatters = [formatters];
		return makeFormatterFn(formatters, this.$formatters).bind(this);
	}

	/**
	 * @param {Element} el 
	 */
	$execDirectives(el) {
		if (!el.attributes || !el.attributes.length) return;
		for (const { name, arg, modifiers } of directivesOf(el)) {
			const dir = d.all[name];
			if (dir === undefined) domError(`directive "${name}" not found`, el);

			switch (dir.argState) {
				case 'empty':
					if (!!arg) domError(`directive "${name}" needed no arguments, but there is an argument`, el);
					break;
				case 'required':
					if (!arg) domError(`directive needs an arguments, but there's nothing`, el);
					break;
			}

			const attrValue = el.getAttribute(toString({ name, arg, modifiers })),
				argArray = [el, attrValue, modifiers, arg];

			if (typeof dir.callback === 'function') {
				dir.callback.apply(this, argArray);
			} else {
				if ('ready' in dir.callback) dir.callback.ready.apply(this, argArray);
				if ('updated' in dir.callback) {
					this.$on('', () => {
						dir.callback.updated.apply(this, argArray);
					}, {
							type: 'DIRECTIVE',
							id: el
						});
				}
			}
		}
	}

	$interpolation() {
		getTextNodes(this.$el).forEach(this.$interpolateNode, this);
	}

	/**
	 * @param {Node} node 
	 */
	$interpolateNode(node) {
		if (!interpolation.contains(node.textContent)) return;

		let exps = arrayUnique(node.textContent.match(interpolation.global).map(interpolation.trim));
		const initText = node.textContent;

		for (const exp of exps) {
			const [prop, ...formatters] = exp.split(' | '),
			reg = new RegExp(`\\{ ${exp.replace(/\|/g, '\\|')  } \\}`, 'g'),
			formatterFn = this.$pipeFormatters(formatters);

			this.$on(prop, v => {
				let replaced = initText.replace(reg, formatterFn(v));
				if (node.textContent !== replaced) node.textContent = replaced;
			}, {
					immediate: true,
					type: 'INTERPOLATION',
					id: node
				});
		}
	}

	$observe() {
		const m = new MutationObserver(muts => {
			for (const { addedNodes, removedNodes } of muts) {
				for (const anode of addedNodes) {
					switch (anode.nodeType) {
						case document.TEXT_NODE:
							this.$interpolateNode(anode);
							break;
						case document.ELEMENT_NODE:
							getTextNodes(anode).forEach(this.$interpolateNode, this);
							this.$execDirectives(anode);
							break;
					}
				}
				for (const rnode of removedNodes) {
					const removeNodeFromEvents = (node, type = 'INTERPOLATION') => {
						this.$events.filter(e => {
							return e.type === type && e.id === node;
						}).map(e => this.$events.indexOf(e)).forEach(i => {
							this.$events.splice(i, 1);
						});
					};

					if (rnode.nodeType === document.TEXT_NODE) {
						removeNodeFromEvents(rnode);
					} else if (rnode.nodeType === document.ELEMENT_NODE) {
						getTextNodes(rnode).forEach(removeNodeFromEvents);
						removeNodeFromEvents(rnode, 'DIRECTIVE');
					}
				}
			}
		});

		m.observe(this.$el, {
			childList: true,
			subtree: true
		});
	}

	$on(key, fn, options = {}) {
		this.$events.push({
			key,
			fn,
			type: options.type,
			id: options.id,
		});
		if (options.immediate) this.$emit(key);
	}

	$emit(key) {
		this.$events.filter(ev => {
			return key ? ev.key === key : true;
		}).forEach(ev => {
			let args = ev.key ? [this[ev.key]] : [];
			ev.fn.apply(this, args);
		});
	}
}

Hdash.directive = d.register;

export default Hdash;