var Spreax = (function () {
	var _registry = {};
	function register(name, callback, argumentIsRequired) {
		if ( argumentIsRequired === void 0 ) argumentIsRequired = false;
		if (name in _registry) { throw new Error(("directive \"" + name + "\" already exists")); }
		if (!/^[a-z]+(?:-[a-z]+)*$/.test(name)){
			throw new Error(("\"" + name + "\" is not a valid directive name"));
		}
		_registry[name] = { argumentIsRequired: argumentIsRequired, callback: callback };
	}
	var all = _registry;

	var PRIMITIVES = {
		'null': null,
		'!0': !0,
		'!1': !1,
		'false': false,
		'true': true,
		'undefined': undefined
	};

	function parse(string) {
		var match = string.match(/^(.+) = (.+)$/);
		if (match === null) { throw new SyntaxError(("string \"" + string + "\" is not a valid assignment statement")); }
		var prop = match[1];
		var value = match[2];
		var usesProperty = false;
		if (value in PRIMITIVES) { value = PRIMITIVES[value]; }
		else if (!isNaN(Number(value))) { value = Number(value); }
		else if (/^(['"`]).*\1$/.test(value)) { value = value.slice(1, -1); }
		else if (/^\w+$/i.test(value)) { usesProperty = true; }
		else { throw new SyntaxError(("could not find any values matching \"" + value + "\"")); }
		return {
			prop: prop,
			getValue: function (o) { return usesProperty ? o[value] : value; }
		};
	}

	register('on', function(el, value, modifiers, arg) {
		var this$1 = this;
		var hasShortcut = / = .+$/.test(value);
		el.addEventListener(arg, function (event) {
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
	}, true);

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
			if (ps.className) { selector += '.' + ps.className.trim().split(' ').join('.'); }
			if (ps.id) { selector += '#' + ps.id; }
			selector = selector.replace(/^div([^$]+)/, '$1');
			return selector;
		});
		return pathSections.join(' > ');
	}

	var ErrorInElement =              (function (Error) {
		function ErrorInElement(message, el) {
			Error.call(this, message);
			this.message = message + '\n error at: ' + generateSelector(el);
		}
		if ( Error ) ErrorInElement.__proto__ = Error;
		ErrorInElement.prototype = Object.create( Error && Error.prototype );
		ErrorInElement.prototype.constructor = ErrorInElement;
		return ErrorInElement;
	}(Error));

	register('model', {
		ready: function ready(el, value, ref) {
			var this$1 = this;
			var lazy = ref.lazy;
			if (!['select', 'input', 'textarea'].includes(el.tagName.toLowerCase())) {
				throw new ErrorInElement("model directive only works on input, textarea or select tags", el);
			}
			if (el.type === 'checkbox') {
				el.checked = !!this[value];
			} else {
				el.value = this[value];
			}
			el.addEventListener('change', function () {
				this$1[value] = el.type === 'checkbox' ? el.checked : el.value;
			});
			if (el.type === 'text' && !lazy) {
				el.addEventListener('keydown', function () {
					setTimeout(function () {
						this$1[value] = el.value;
					}, 0);
				});
			}
		},
		updated: function updated(el, value) {
			var prop = el.type === 'checkbox' ? 'checked' : 'value';
			el[prop] = this[value];
		}
	});

	register('class', function (el, value, mod, arg) {
		var prop = value || arg;
		this.$on(prop, function (v) {
			el.classList[!!v ? 'add' : 'remove'](arg || value);
			var attr = el.getAttribute('class');
			if (attr !== null && !attr.length) { el.removeAttribute('class'); }
		}, {
			immediate: true,
			id: el,
			type: 'DIRECTIVE'
		});
	}, true);

	function record(keys, value){
		var o = {};
		keys.forEach(function (k) {
			o[k] = value;
		});
		return o;
	}

	function toString(d){
		var o = "sp-" + (d.name);
		if (d.arg) { o += ':' + d.arg; }
		var k = Object.keys(d.modifiers);
		if (k.length) { o += '.' + k.join('.'); }
		return o;
	}

	function directivesOf(el) {
		var obj;
		var attributes = el.attributes;
		var directives = [];
		var loop = function () {
			var ref$1 = list[i];
			var attrName = ref$1.name;
			if (!/^sp-/.test(attrName)) { return; }
			attrName = attrName.replace(/^sp-/, '');
			var ref = attrName.match(/^([a-z]+(?:-[a-z]+)*)(:[a-z0-9]+)?((?:\.[a-z0-9]+))*$/);
			var name = ref[1];
			var arg = ref[2];
			var modifiers = ref[3];
			if (arg) { arg = arg.replace(/^:/, ''); }
			var modifierObject = modifiers ? record(modifiers.slice(1).split('.'), true) : {};
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
			return withThisName.length > 1 ? withThisName[0] : d;
		});
	}

	function makeFormatterFn(formatters, source) {
		if (!formatters.length) { return function (v) { return v; }; }
		return formatters.map(function (f) {
			if (!(f in source)) { throw new Error(("formatter " + f + " not found")); }
			else { return source[f]; }
		}).reduce(function (a, b) { return function (arg) { return b(a(arg)); }; });
	}

	function interpolation (node, callback) {
		var RE = /{{( ?)\w+(?: \| \w+)*\1}}/gi,
			text = node.textContent;
		if (!RE.test(text)) { return; }
		var matches = [];
		text.replace(RE, function (match, index) {
			matches.push({
				string: match,
				startIndex: index
			});
			return match;
		});
		for (var i = 0, list = matches; i < list.length; i += 1) {
			var ref$1 = list[i];
			var string = ref$1.string;
			var startIndex = ref$1.startIndex;
			var ref = string.replace(/^{{/, '')
				.replace(/}}$/, '').trim().split(' | ');
			var prop = ref[0];
			var formatters = ref.slice(1);
			callback({
				initialText: text,
				node: node,
				formatters: formatters,
				match: { startIndex: startIndex, string: string },
				propertyName: prop
			});
		}
	}

	function getTextNodes(el) {
		var n = [];
		for (var i = 0, list = el.childNodes; i < list.length; i += 1) {
			var node = list[i];
			if (!/\S+/g.test(node.textContent)) { continue; }
			var type = node.nodeType;
			if (type === Node.TEXT_NODE) {
				n.push(node);
			} else if (type === Node.ELEMENT_NODE) {
				n = n.concat( getTextNodes(node));
			}
		}
		return n;
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
						if (mut.type === 'childList' && mut.target.hasChildNodes(anode)) { continue; }
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
		});
	}

	var Spreax = function Spreax(el, options) {
		if (typeof el === 'string') { this.$el = document.querySelector(el); }
		else if (el instanceof HTMLElement) { this.$el = el; }
		else {
			throw new TypeError(("wrong selector or element: expected element or string, got \"" + (String(el)) + "\""));
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
	Spreax.prototype.$extendWith = function $extendWith (state, actions, computed, formatters) {
			var this$1 = this;
		this.$makeProxy(state);
		Object.keys(state).forEach(function (p) {
			Object.defineProperty(this$1, p, {
				get: function () { return this$1.$_proxy[p]; },
				set: function (nv) {
					this$1.$_proxy[p] = nv;
				}
			});
		});
		Object.entries(actions).forEach(function (ref) {
				var name = ref[0];
				var fn = ref[1];
			this$1[name] = fn.bind(this$1);
		});
		Object.entries(computed).forEach(function (ref) {
				var name = ref[0];
				var fn = ref[1];
			Object.defineProperty(this$1, name, {
				get: fn.bind(this$1),
				set: function () { return false; }
			});
		});
		Object.entries(formatters).forEach(function (ref) {
				var name = ref[0];
				var fn = ref[1];
			this$1.$formatters[name] = fn.bind(this$1);
		});
	};
	Spreax.prototype.$makeProxy = function $makeProxy (o) {
			var this$1 = this;
		this.$_proxy = new Proxy(o, {
			get: function (obj, key) {
				if (!obj.hasOwnProperty(key)) { throw new Error(("unknown state property \"" + key + "\"")); }
				return obj[key];
			},
			set: function (obj, key, value) {
				if (!obj.hasOwnProperty(key)) { throw new Error(("unknown state property \"" + key + "\"")); }
				if (value === obj[key]) { return; }
				obj[key] = value;
				this$1.$emit(key);
				this$1.$emit();
				return true;
			},
			deleteProperty: function () { return false; }
		});
	};
	Spreax.prototype.$pipeFormatters = function $pipeFormatters (formatters) {
		if (arguments.length > 1) { formatters = Array.prototype.slice.call(arguments); }
		else if (arguments.length === 1 && typeof formatters === 'string') { formatters = [formatters]; }
		return makeFormatterFn(formatters, this.$formatters).bind(this);
	};
	Spreax.prototype.$execDirectives = function $execDirectives (el) {
			var this$1 = this;
		if (!el.attributes.length) { return; }
		var dirsOfEl = directivesOf(el);
		var loop = function () {
			var di = list[i];
				if (!all.hasOwnProperty(di.name)) { throw new ErrorInElement(("directive \"" + (di.name) + "\" not found"), el); }
			var ref = all[di.name];
				var argumentIsRequired = ref.argumentIsRequired;
				var callback = ref.callback;
			if (argumentIsRequired && !di.arg) {
				throw new ErrorInElement("directive needs an arguments, but there's nothing", el);
			}
			var attrValue = el.getAttribute(("" + di)),
			argArray = [el, attrValue, di.modifiers, di.arg];
			if (typeof callback === 'function') { callback.apply(this$1, argArray); }
			else {
				if ('ready' in callback) { callback.ready.apply(this$1, argArray); }
				if ('updated' in callback) {
					this$1.$on('', function () {
						callback.updated.apply(this$1, argArray);
					}, {
						type: 'DIRECTIVE',
						node: el
					});
				}
			}
		};
			for (var i = 0, list = dirsOfEl; i < list.length; i += 1) loop();
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
					type: 'INTERPOLATION',
					node: node
				});
		});
	};
	Spreax.prototype.$observe = function $observe () {
			var this$1 = this;
		var removeNodeFromEvents = function (node, type) {
				if ( type === void 0 ) type = 'INTERPOLATION';
			var events = this$1.$events.filter(function (e) {
				return e.type === type && e.node === node;
			}).map(function (_, i) { return i; });
			for (var i = 0, list = events; i < list.length; i += 1) {
					var e = list[i];
					this$1.$events.splice(e, 1);
				}
		};
		makeObserver({
			textAdded: this.$interpolation.bind(this),
			elementAdded: this.$execDirectives.bind(this),
			textRemoved: removeNodeFromEvents,
			elementRemoved: function (n) {
				removeNodeFromEvents(n, 'DIRECTIVE');
			}
		}).observe(this.$el, {
			childList: true,
			subtree: true
		});
	};
	Spreax.prototype.$on = function $on (prop, fn, options) {
			if ( options === void 0 ) options = {};
		this.$events.push(Object.assign({}, {prop: prop,
			fn: fn},
			'type' in options ? { type: options.type } : {},
			'node' in options ? { node: options.node } : {}));
		if (options.immediate) { this.$emit(prop); }
	};
	Spreax.prototype.$emit = function $emit (prop) {
			var this$1 = this;
		this.$events.filter(function (ev) {
			return prop ? ev.prop === prop : true;
		}).forEach(function (ev) {
			var args = ev.prop ? [this$1[ev.prop]] : [];
			ev.fn.apply(this$1, args);
		});
	};
	Spreax.directive = register;

	return Spreax;

}());
