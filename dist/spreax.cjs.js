function getTextNodes(el) {
	var n = [];
	var TEXT_NODE = Node.TEXT_NODE;
	var ELEMENT_NODE = Node.ELEMENT_NODE;
	for (var i = 0, list = el.childNodes; i < list.length; i += 1) {
		var node = list[i];
		if (!/\S+/g.test(node.textContent)) { continue }
		var type = node.nodeType;
		if (type === TEXT_NODE) { n.push(node); }
		else if (type === ELEMENT_NODE) { n = n.concat(getTextNodes(node)); }
		else { continue }
	}
	return n
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
	var sections = [];
	while (el !== root) {
		sections.unshift(el);
		el = el.parentElement;
	}
	sections.unshift(root);
	return sections.map(function (ps) {
		var selector = ps.tagName.toLowerCase();
		if (ps.className) { selector += "." + (ps.className.trim().split(' ').join('.')); }
		if (ps.id) { selector += "#" + (ps.id); }
		selector = selector.replace(/^div([^$]+)/, '$1');
		return selector
	}).join(' > ')
}

var SpreaxDOMError = (function (Error) {
	function SpreaxDOMError(message, el) {
		Error.call(this, (message + "\nat: " + (generateSelector(el))));
	}
	if ( Error ) SpreaxDOMError.__proto__ = Error;
	SpreaxDOMError.prototype = Object.create( Error && Error.prototype );
	SpreaxDOMError.prototype.constructor = SpreaxDOMError;
	return SpreaxDOMError;
}(Error));

var REGISTRY = {};
function register(name, callback, argRequired) {
	if ( argRequired === void 0 ) argRequired = false;
	if (name in REGISTRY) { throw new Error(("directive \"" + name + "\" already exists")) }
	if (!/^[a-z]+(?:-[a-z]+)*$/.test(name)){
		throw new Error(("\"" + name + "\" is not a valid directive name"))
	}
	REGISTRY[name] = { argRequired: argRequired, callback: callback };
}

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
}, true);

register('model', {
	ready: function ready(ref) {
		var this$1 = this;
		var el = ref.element;
		var propName = ref.attributeValue;
		var lazy = ref.modifiers.lazy;
		if (!['select', 'input', 'textarea'].includes(el.tagName.toLowerCase())) {
			throw new SpreaxDOMError("model directive only works on input, textarea or select tags", el)
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
	this.$onUpdate(function (v) {
		el.classList[v ? 'add' : 'remove'](className || propName);
		var attr = el.getAttribute('class');
		if (attr !== null && !attr.length) { el.removeAttribute('class'); }
	}, {
		immediate: true,
		ownerNode: el,
		prop: propName || className
	});
}, true);

register('style', function (ref) {
	var element = ref.element;
	var cssProp = ref.argument;
	var attributeValue = ref.attributeValue;
	cssProp = kebabToCamel(cssProp);
	var noUnits = 'opacity, z-index, font-weight, line-height'.split(', ');
	this.$onUpdate(function (v) {
		if (!isNaN(+v) && !noUnits.includes(cssProp)) { v = v + "px"; }
		element.style[cssProp] = v;
	}, {
		ownerNode: element,
		immediate: true,
		prop: attributeValue || cssProp
	});
}, true);

function execDirectives (el, callbackFn) {
	if (!el.attributes.length) { return }
	var dirsOfEl = directivesOf(el);
	for (var i = 0, list = dirsOfEl; i < list.length; i += 1) {
		var di = list[i];
		if (!REGISTRY.hasOwnProperty(di.name)) { throw new SpreaxDOMError(("directive \"" + (di.name) + "\" not found"), el) }
		var ref = REGISTRY[di.name];
		var argRequired = ref.argRequired;
		var callback = ref.callback;
		if (argRequired && !di.arg) { throw new SpreaxDOMError("directive needs an arguments, but there's nothing", el) }
		callbackFn(callback, {
			element: el,
			attributeValue: el.getAttribute(("" + di)),
			modifiers: di.modifiers,
			argument: di.arg
		});
	}
}

function makeFormatterFn(formatters, source) {
	if (!formatters.length) { return function (v) { return v; } }
	return formatters.map(function (f) {
		if (!source.hasOwnProperty(f)) { throw new Error(("formatter \"" + f + "\" not found")) }
		else { return source[f] }
	}).reduce(function (a, b) { return function (c) { return b(a(c)); }; })
}

function createObserver(hooks) {
	var TEXT_NODE = Node.TEXT_NODE;
	var ELEMENT_NODE = Node.ELEMENT_NODE;
	return new MutationObserver(function (muts) {
		for (var i$2 = 0, list$2 = muts; i$2 < list$2.length; i$2 += 1) {
			var mut = list$2[i$2];
			for (var i = 0, list = mut.addedNodes; i < list.length; i += 1) {
				var anode = list[i];
				if (anode.nodeType === TEXT_NODE) {
					if (mut.type === 'childList' && mut.target.hasChildNodes(anode)) { continue }
					hooks.textAdded(anode);
				} else if (anode.nodeType === ELEMENT_NODE) {
					getTextNodes(anode).forEach(function (n) { return hooks.textAdded(n); });
					hooks.elementAdded(anode);
				}
			}
			for (var i$1 = 0, list$1 = mut.removedNodes; i$1 < list$1.length; i$1 += 1) {
				var rnode = list$1[i$1];
				if (rnode.nodeType === TEXT_NODE) { hooks.textRemoved(rnode); }
				else if (rnode.nodeType === ELEMENT_NODE) {
					getTextNodes(rnode).forEach(function (n) { return hooks.textRemoved(n); });
					hooks.elementRemoved(rnode);
				}
			}
		}
	})
}

function makeProxy(object, hooks) {
	return new Proxy(object, {
		get: function get(obj, key) {
			if (!obj.hasOwnProperty(key)) { throw new Error(("unknown state property \"" + key + "\"")) }
			return obj[key]
		},
		deleteProperty: function () { return false; },
		set: function set(obj, key, value) {
			if (!obj.hasOwnProperty(key)) { throw new Error(("unknown state property \"" + key + "\"")) }
			if (obj[key] === value) { return false }
			hooks.beforeSet(obj, key);
			obj[key] = value;
			hooks.setted(obj, key);
			return true
		}
	})
}

function extend(instance, ref) {
	var state = ref.state; if ( state === void 0 ) state = {};
	var actions = ref.actions; if ( actions === void 0 ) actions = {};
	var computed = ref.computed; if ( computed === void 0 ) computed = {};
	var formatters = ref.formatters; if ( formatters === void 0 ) formatters = {};
	var define = Object.defineProperty;
	var loop = function ( p ) {
		define(instance, p, {
			get: function () { return instance.$proxy[p]; },
			set: function (nv) { instance.$proxy[p] = nv; },
			configurable: false,
			enumerable: false
		});
	};
	for (var p in state) loop( p );
	for (var a in actions) { instance[a] = actions[a].bind(instance); }
	for (var c in computed) {
		define(instance, c, {
			get: computed[c].bind(instance),
			set: function () { return false; },
			configurable: false
		});
	}
	for (var f in formatters) { instance.$formatters[f] = formatters[f].bind(instance); }
}

var Spreax = function Spreax(el, options) {
	var this$1 = this;
	if (typeof el === 'string') { this.$el = document.querySelector(el); }
	else if (el instanceof HTMLElement) { this.$el = el; }
	else { throw new TypeError(("wrong selector or element: expected element or string, got \"" + (String(el)) + "\"")) }
	this.$events = [];
	this.$formatters = {};
	this.$makeProxy(options.state);
	extend(this, {
		state: options.state, actions: options.actions,
		computed: options.computed, formatters: options.formatters
	});
	getTextNodes(this.$el).forEach(this.$processTemplate, this);
	this.$el.querySelectorAll('*').forEach(this.$execDirectives, this);
	this.$observe();
	this.$diffProp = null;
	this.$diffPropValue = undefined;
	var watch = options.watch || {};
	var loop = function ( w ) {
		this$1.$onUpdate(function (nv) {
		watch[w].call(this$1, nv, this$1.$diffPropValue);
	}, { prop: w });
	};
	for (var w in watch) loop( w );
};
Spreax.prototype.$makeProxy = function $makeProxy (o) {
		var this$1 = this;
		if ( o === void 0 ) o = {};
	this.$proxy = makeProxy(o, {
		beforeSet: function (obj, key) {
			this$1.$diffProp = key;
			this$1.$diffPropValue = obj[key];
		},
		setted: function () { return this$1.$update(); }
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
			if ('updated' in callback) { this$1.$onUpdate(function () {
				callback.updated.call(this$1, args);
			}, { ownerNode: el }); }
		}
	});
};
Spreax.prototype.$processTemplate = function $processTemplate (node) {
		var this$1 = this;
	var RE = /#\[\w+(?: \w+)*\]/g,
	rawText = node.textContent;
	if (!RE.test(rawText)) { return }
	var replaceByObject = function (obj) {
		return rawText.replace(RE, function ($1) {
			var ref = $1.slice(2, -1).split(' ');
				var prop = ref[0];
				var formatters = ref.slice(1);
			return this$1.$pipeFormatters(formatters)(obj[prop])
		})
	};
	this.$onUpdate(function () {
			var obj;
		var oldText = replaceByObject(Object.assign({}, this$1.$proxy,
			( obj = {}, obj[this$1.$diffProp] = this$1.$diffPropValue, obj ))),
		newText = replaceByObject(this$1),
		shouldReplace = !this$1.$diffProp ? true : (oldText !== newText);
		if (shouldReplace) { node.textContent = newText; }
	}, {
		immediate: true,
		ownerNode: node
	});
};
Spreax.prototype.$observe = function $observe () {
		var this$1 = this;
	var removeNodeFromEvents = function (ownerNode) {
		var events = this$1.$events.filter(function (e) { return e.ownerNode === ownerNode; }).map(function (_, i) { return i; });
		for (var i = 0, list = events; i < list.length; i += 1) {
				var e = list[i];
				this$1.$events.splice(e, 1);
			}
	};
	createObserver({
		textAdded: this.$processTemplate.bind(this),
		elementAdded: this.$execDirectives.bind(this),
		textRemoved: removeNodeFromEvents,
		elementRemoved: removeNodeFromEvents
	}).observe(this.$el, { childList: true, subtree: true });
};
Spreax.prototype.$onUpdate = function $onUpdate (fn, ref) {
		var prop = ref.prop; if ( prop === void 0 ) prop = '';
		var ownerNode = ref.ownerNode;
		var immediate = ref.immediate; if ( immediate === void 0 ) immediate = false;
	var id = (Math.random() * 1e6 >> 0).toString().padEnd(6, '0');
	this.$events.push(Object.assign({}, {prop: prop, fn: fn, id: id},
		ownerNode ? { ownerNode: ownerNode } : {}));
	if (immediate) { this.$update(id); }
};
Spreax.prototype.$update = function $update (id) {
		var this$1 = this;
	this.$events.filter(function (ev) {
		if (id) { return ev.id === id }
		return ev.prop ? ev.prop === this$1.$diffProp : true
	}).forEach(function (ref) {
			var prop = ref.prop;
			var fn = ref.fn;
		fn.call(this$1, this$1[prop]);
	});
};

Spreax.directive = register;

module.exports = Spreax;
