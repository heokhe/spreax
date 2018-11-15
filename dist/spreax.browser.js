var Spreax = (function () {
	function makeFormatterFn(formatters, source) {
		if (!formatters.length) { return function (v) { return v; } }
		return formatters.map(function (f) {
			if (!(f in source)) { throw new Error(("formatter \"" + f + "\" not found")) }
			else { return source[f] }
		}).reduce(function (a, b) { return function (arg) { return b(a(arg)); }; })
	}

	function interpolation (node, callback) {
		var RE = /#\[( ?)\w+(?: \w+)*\1\]/gi,
		text = node.textContent;
		if (!RE.test(text)) { return }
		var matches = [];
		text.replace(RE, function (string, _, index) {
			matches.push({ string: string, startIndex: index });
			return string
		});
		for (var i = 0, list = matches; i < list.length; i += 1) {
			var ref$1 = list[i];
			var string = ref$1.string;
			var startIndex = ref$1.startIndex;
			var ref = string.replace(/^#\[ ?/, '')
				.replace(/ ?\]$/, '').split(' ');
			var prop = ref[0];
			var formatters = ref.slice(1);
			return callback({
				initialText: text,
				node: node, formatters: formatters,
				match: { startIndex: startIndex, string: string },
				propertyName: prop
			})
		}
	}

	function getTextNodes(el) {
		var n = [];
		var TEXT_NODE = Node.TEXT_NODE;
		var ELEMENT_NODE = Node.ELEMENT_NODE;
		for (var i = 0, list = el.childNodes; i < list.length; i += 1) {
			var node = list[i];
			if (!/\S+/g.test(node.textContent)) { continue }
			var type = node.nodeType;
			if (type === TEXT_NODE) { n.push(node); }
			else if (type === ELEMENT_NODE) { n = n.concat( getTextNodes(node)); }
			else { continue }
		}
		return n
	}

	function makeObserver(events) {
		var TEXT_NODE = Node.TEXT_NODE;
		var ELEMENT_NODE = Node.ELEMENT_NODE;
		return new MutationObserver(function (muts) {
			for (var i$2 = 0, list$2 = muts; i$2 < list$2.length; i$2 += 1) {
				var mut = list$2[i$2];
				for (var i = 0, list = mut.addedNodes; i < list.length; i += 1) {
					var anode = list[i];
					if (anode.nodeType === TEXT_NODE) {
						if (mut.type === 'childList' && mut.target.hasChildNodes(anode)) { continue }
						events.textAdded(anode);
					} else if (anode.nodeType === ELEMENT_NODE) {
						getTextNodes(anode).forEach(function (n) { return events.textAdded(n); });
						events.elementAdded(anode);
					}
				}
				for (var i$1 = 0, list$1 = mut.removedNodes; i$1 < list$1.length; i$1 += 1) {
					var rnode = list$1[i$1];
					if (rnode.nodeType === TEXT_NODE) { events.textRemoved(rnode); }
					else if (rnode.nodeType === ELEMENT_NODE) {
						getTextNodes(rnode).forEach(function (n) { return events.textRemoved(n); });
						events.elementRemoved(rnode);
					}
				}
			}
		})
	}

	function record(keys, value){
		var o = {};
		keys.forEach(function (k) {
			o[k] = value;
		});
		return o
	}

	function toString(d){
		var o = "sp-" + (d.name);
		if (d.arg) { o += ":" + (d.arg); }
		var k = Object.keys(d.modifiers);
		if (k.length) { o += "." + (k.join('.')); }
		return o
	}

	function kebabToCamel(str) {
		return str.replace(/-([a-z])/g, function (_, next) { return next.toUpperCase(); })
	}

	function directivesOf(el) {
		var obj;
		var attributes = el.attributes;
		var directives = [];
		var loop = function () {
			var ref$1 = list[i];
			var attrName = ref$1.name;
			if (!/^sp-/.test(attrName)) { return }
			attrName = attrName.replace(/^sp-/, '');
			var ref = attrName.match(/^([a-z]+(?:-[a-z]+)*)(:[a-z0-9]+(?:-[a-z0-9]+)*)?((?:\.[a-z0-9]+))*$/);
			var name = ref[1];
			var arg = ref[2];
			var modifiers = ref[3];
			if (arg) { arg = arg.replace(/^:/, ''); }
			var modifierObject = modifiers ? record(modifiers.slice(1).split('.').map(kebabToCamel), true) : {};
			var d = {
				name: name,
				arg: arg || null,
				modifiers: modifierObject
			};
			directives.push(Object.assign({}, d,
				( obj = {}, obj[Symbol.toPrimitive] = function (hint) { return hint === 'number' ? NaN : toString(d); }, obj )));
		};
		for (var i = 0, list = attributes; i < list.length; i += 1) loop();
		return directives.filter(function (d, _, arr) {
			var getFullName = function (e) { return e.arg ? [e.name, e.arg].join(':') : e.name; },
			withThisName = arr.filter(function (e) { return getFullName(e) === getFullName(d); });
			return withThisName.length > 1 ? withThisName[0] : d
		})
	}

	function generateSelector(el, root) {
		if ( root === void 0 ) root = 'body';
		if (typeof root === 'string') { root = document.querySelector(root); }
		var pathSections = [];
		while (el !== root) {
			pathSections.unshift(el);
			el = el.parentElement;
		}
		pathSections.unshift(root);
		pathSections = pathSections.map(function (ps) {
			var selector = ps.tagName.toLowerCase();
			if (ps.className) { selector += "." + (ps.className.trim().split(' ').join('.')); }
			if (ps.id) { selector += "#" + (ps.id); }
			selector = selector.replace(/^div([^$]+)/, '$1');
			return selector
		});
		return pathSections.join(' > ')
	}

	var ErrorInElement = (function (Error) {
		function ErrorInElement(message, el) {
			Error.call(this, message);
			this.message = message + "\n error at: " + (generateSelector(el));
		}
		if ( Error ) ErrorInElement.__proto__ = Error;
		ErrorInElement.prototype = Object.create( Error && Error.prototype );
		ErrorInElement.prototype.constructor = ErrorInElement;
		return ErrorInElement;
	}(Error));

	var _registry = {};
	function register(name, callback, options) {
		if ( options === void 0 ) options = {};
		if (name in _registry) { throw new Error(("directive \"" + name + "\" already exists")) }
		if (!/^[a-z]+(?:-[a-z]+)*$/.test(name)){
			throw new Error(("\"" + name + "\" is not a valid directive name"))
		}
		_registry[name] = { options: options, callback: callback };
	}
	var all = _registry;

	var PRIMITIVES = {
		'null': null,
		'!0': !0,
		'!1': !1,
		'false': false,
		'true': true,
		undefined: undefined
	};
	function parse (string) {
		var match = string.match(/^(.+) = (.+)$/);
		if (match === null) { throw new SyntaxError(("string \"" + string + "\" is not a valid assignment statement")) }
		var prop = match[1];
		var value = match[2];
		var usesProperty = false;
		if (value in PRIMITIVES) { value = PRIMITIVES[value]; }
		else if (!isNaN(+value)) { value = Number(value); }
		else if (/^(['"`]).*\1$/.test(value)) { value = value.slice(1, -1); }
		else if (/^!?\w+$/i.test(value)) { usesProperty = true; }
		else { throw new SyntaxError(("could not find any values matching \"" + value + "\"")) }
		return {
			prop: prop,
			getValue: function (o) {
				if (!usesProperty) { return value }
				return value.startsWith('!') ? !o[value.slice(1)] : o[value]
			}
		}
	}

	var list = [];
	function isValidEvent(event) {
		if (list.length === 0) { list = Object.keys(window).filter(function (e) { return /^on/.test(e); }).map(function (e) { return e.replace(/^on/, ''); }); }
		return list.includes(event)
	}

	register('on', function (ref) {
		var this$1 = this;
		var el = ref.element;
		var value = ref.attributeValue;
		var modifiers = ref.modifiers;
		var eventName = ref.argument;
		if (!isValidEvent(eventName)) { throw new TypeError(("event \"" + eventName + "\" is not a valid DOM event.")) }
		var hasShortcut = / = .+$/.test(value);
		el.addEventListener(eventName, function (event) {
			if (modifiers.prevent) { event.preventDefault(); }
			if (hasShortcut) {
				var pa = parse(value);
				this$1[pa.prop] = pa.getValue(this$1);
			} else {
				this$1[value]();
			}
		}, {
			once: modifiers.once,
			passive: modifiers.passive,
			capture: modifiers.capture,
		});
	}, { argumentIsRequired: true });

	register('model', {
		ready: function ready(ref) {
			var this$1 = this;
			var el = ref.element;
			var propName = ref.attributeValue;
			var lazy = ref.modifiers.lazy;
			if (!['select', 'input', 'textarea'].includes(el.tagName.toLowerCase())) {
				throw new ErrorInElement("model directive only works on input, textarea or select tags", el)
			}
			if (el.type === 'checkbox') { el.checked = !!this[propName]; }
			else { el.value = this[propName]; }
			el.addEventListener('change', function () {
				this$1[propName] = el.type === 'checkbox' ? el.checked : el.value;
			});
			if (el.type === 'text' && !lazy) {
				el.addEventListener('keydown', function () {
					setTimeout(function () {
						this$1[propName] = el.value;
					}, 0);
				});
			}
		},
		updated: function updated(ref) {
			var el = ref.element;
			var value = ref.attributeValue;
			var propName = el.type === 'checkbox' ? 'checked' : 'value';
			el[propName] = this[value];
		}
	});

	register('class', function (ref) {
		var el = ref.element;
		var className = ref.argument;
		var propName = ref.attributeValue;
		this.$on(propName || className, function (v) {
			el.classList[v ? 'add' : 'remove'](className || propName);
			var attr = el.getAttribute('class');
			if (attr !== null && !attr.length) { el.removeAttribute('class'); }
		}, {
			immediate: true,
			node: el,
			type: 'd'
		});
	}, { argumentIsRequired: true });

	register('style', function (ref) {
		var element = ref.element;
		var cssProp = ref.argument;
		var attributeValue = ref.attributeValue;
		cssProp = kebabToCamel(cssProp);
		var noUnits = 'opacity, z-index, font-weight, line-height'.split(', ');
		this.$on(attributeValue || cssProp, function (v) {
			if (!isNaN(+v) && !noUnits.includes(cssProp)) { v = v + "px"; }
			element.style[cssProp] = v;
		}, {
			node: element,
			type: 'd',
			immediate: true
		});
	}, { argumentIsRequired: true });

	function execDirectives (el, callbackFn) {
		if (!el.attributes.length) { return }
		var dirsOfEl = directivesOf(el);
		for (var i = 0, list = dirsOfEl; i < list.length; i += 1) {
			var di = list[i];
			if (!all.hasOwnProperty(di.name)) { throw new ErrorInElement(("directive \"" + (di.name) + "\" not found"), el) }
			var ref = all[di.name];
			var options = ref.options;
			var callback = ref.callback;
			if (options.argumentIsRequired && !di.arg) { throw new ErrorInElement("directive needs an arguments, but there's nothing", el) }
			callbackFn(callback, {
				element: el,
				attributeValue: el.getAttribute(("" + di)),
				modifiers: di.modifiers,
				argument: di.arg
			});
		}
	}

	var Spreax = function Spreax(el, options) {
		if (typeof el === 'string') { this.$el = document.querySelector(el); }
		else if (el instanceof HTMLElement) { this.$el = el; }
		else {
			throw new TypeError(("wrong selector or element: expected element or string, got \"" + (String(el)) + "\""))
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
	};
	Spreax.prototype.$extendWith = function $extendWith (state, actions, computed, formatters               ) {
			var this$1 = this;
		this.$makeProxy(state);
		var loop = function ( p ) {
			Object.defineProperty(this$1, p, {
				get: function () { return this$1.$_proxy[p]; },
				set: function (nv) { this$1.$_proxy[p] = nv; }
			});
		};
			for (var p in state) loop( p );
		for (var a in actions) { this$1[a] = actions[a].bind(this$1); }
		for (var c in computed) {
			Object.defineProperty(this$1, c, {
				get: computed[c].bind(this$1),
				set: function () { return false; }
			});
		}
		for (var f in formatters) { this$1.$formatters[f] = formatters[f].bind(this$1); }
	};
	Spreax.prototype.$makeProxy = function $makeProxy (o) {
			var this$1 = this;
		this.$_proxy = new Proxy(o, {
			get: function (obj, key) {
				if (!obj.hasOwnProperty(key)) { throw new Error(("unknown state property \"" + key + "\"")) }
				return obj[key]
			},
			set: function (obj, key, value) {
				if (!obj.hasOwnProperty(key)) { throw new Error(("unknown state property \"" + key + "\"")) }
				if (value === obj[key]) { return }
				this$1.$_snapshot[key] = obj[key];
				obj[key] = value;
				this$1.$emit(key);
				this$1.$emit();
				return true
			},
			deleteProperty: function () { return false; }
		});
	};
	Spreax.prototype.$pipeFormatters = function $pipeFormatters (formatters) {
		return makeFormatterFn(formatters, this.$formatters).bind(this)
	};
	Spreax.prototype.$execDirectives = function $execDirectives (el) {
			var this$1 = this;
		execDirectives(el, function (callback, args) {
			if (typeof callback === 'function') { callback.call(this$1, args); }
			else {
				if ('ready' in callback) { callback.ready.call(this$1, args); }
				if ('updated' in callback) {
					this$1.$on('', function () {
						callback.updated.call(this$1, args);
					}, { type: 'd', node: el });
				}
			}
		});
	};
	Spreax.prototype.$interpolation = function $interpolation (node) {
			var this$1 = this;
		interpolation(node, function (ref) {
				var itext = ref.initialText;
				var node = ref.node;
				var propertyName = ref.propertyName;
				var formatters = ref.formatters;
				var ref_match = ref.match;
				var startIndex = ref_match.startIndex;
				var string = ref_match.string;
			var formatterFn = this$1.$pipeFormatters(formatters);
			this$1.$on(propertyName, function (v) {
				v = String(formatterFn(v));
				var beforeValue = itext.slice(0, startIndex),
					afterValue = itext.slice(startIndex + string.length + v.length, itext.length),
					newText = beforeValue + v + afterValue;
				if (itext !== newText) { node.textContent = newText; }
			}, {
					immediate: true,
					type: 'i',
					node: node
				});
		});
	};
	Spreax.prototype.$observe = function $observe () {
			var this$1 = this;
		var removeNodeFromEvents = function (node, type) {
				if ( type === void 0 ) type = 'i';
			var events = this$1.$events.filter(function (e) { return e.type === type && e.node === node; }).map(function (_, i) { return i; });
			for (var i = 0, list = events; i < list.length; i += 1) {
					var e = list[i];
					this$1.$events.splice(e, 1);
				}
		};
		makeObserver({
			textAdded: this.$interpolation.bind(this),
			elementAdded: this.$execDirectives.bind(this),
			textRemoved: removeNodeFromEvents,
			elementRemoved: function (n) { removeNodeFromEvents(n, 'd'); }
		}).observe(this.$el, {
			childList: true,
			subtree: true
		});
	};
	Spreax.prototype.$on = function $on (prop, fn, ref) {
			var type = ref.type;
			var node = ref.node;
			var immediate = ref.immediate; if ( immediate === void 0 ) immediate = false;
		this.$events.push(Object.assign({}, {prop: prop, fn: fn},
			type ? { type: type } : {},
			node ? { node: node } : {}));
		if (immediate) { this.$emit(prop); }
	};
	Spreax.prototype.$emit = function $emit (prop) {
			var this$1 = this;
		this.$events.filter(function (ev) {
			return prop ? ev.prop === prop : true
		}).forEach(function (ev) {
			var args = ev.prop ? [this$1[ev.prop]] : [];
			ev.fn.apply(this$1, args);
		});
	};

	Spreax.directive = register;

	return Spreax;

}());
