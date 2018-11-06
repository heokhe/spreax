import * as d from './directives/index';
import directivesOf from './dom/directivesOf';
import toString from './directives/toString';
import makeFormatterFn from './makeFormatterFn';
import interpolation from './interpolation';
import getTextNodes from './dom/getTextNodes';
import makeObserver from './makeObserver';
import ErrorInElement from './domError';

class Spreax {
	constructor(el, options) {
		if (typeof el === 'string') this.$el = document.querySelector(el);
		else if (el instanceof HTMLElement) this.$el = el;
		else {
			throw new TypeError(`wrong selector or element: expected element or string, got "${String(el)}"`);
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
		getTextNodes(this.$el).forEach(this.$interpolation, this);
		this.$el.querySelectorAll('*').forEach(this.$execDirectives, this);
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
				if (!obj.hasOwnProperty(key)) throw new Error(`unknown state property "${key}"`);
				return obj[key];
			},
			set: (obj, key, value) => {
				if (!obj.hasOwnProperty(key)) throw new Error(`unknown state property "${key}"`);
				if (value === obj[key]) return;
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
			if (dir === undefined) throw new ErrorInElement(`directive "${name}" not found`, el);

			switch (dir.argState) {
				case 'empty':
					if (!!arg) throw new ErrorInElement(`directive "${name}" needed no arguments, but there is an argument`, el);
					break;
				case 'required':
					if (!arg) throw new ErrorInElement(`directive needs an arguments, but there's nothing`, el);
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

	$interpolation(node) {
		interpolation(node, ({ initialText: itext, node, propertyName, formatters, match: { startIndex, string } }) => {
			const formatterFn = this.$pipeFormatters(formatters);

			this.$on(propertyName, v => {
				v = String(formatterFn(v));

				let beforeValue = itext.slice(0, startIndex),
				afterValue = itext.slice(startIndex + string.length + v.length, itext.length),
				newText = beforeValue + v + afterValue;

				if (itext !== newText) node.textContent = newText;
			}, {
					immediate: true,
					type: 'INTERPOLATION',
					id: node
				});
		});
	}

	$observe() {
		const removeNodeFromEvents = (node, type = 'INTERPOLATION') => {
			const events = this.$events.filter(e => {
				return e.type === type && e.id === node;
			}).map((_, i) => i);

			for (const e of events) this.$events.splice(e, 1); 
		};

		makeObserver({
			textAdded: this.$interpolation,
			elementAdded: n => {
				getTextNodes(n).forEach(this.$interpolation, this);
				this.$execDirectives(n);
			},
			textRemoved: removeNodeFromEvents,
			elementRemoved: n => {
				getTextNodes(n).forEach(removeNodeFromEvents);
				removeNodeFromEvents(n, 'DIRECTIVE');
			}
		}).observe(this.$el, {
			childList: true,
			subtree: true
		});
	}

	$on(prop, fn, options = {}) {
		this.$events.push({
			prop,
			fn,
			...'type' in options ? { type: options.type } : {},
			...'node' in options ? { node: options.node } : {},
		});
		if (options.immediate) this.$emit(prop);
	}

	$emit(prop) {
		this.$events.filter(ev => {
			return prop ? ev.prop === prop : true;
		}).forEach(ev => {
			let args = ev.prop ? [this[ev.prop]] : [];
			ev.fn.apply(this, args);
		});
	}
}

Spreax.directive = d.register;

export default Spreax;