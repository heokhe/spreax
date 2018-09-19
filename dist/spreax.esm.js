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

function error(msg, isWarn) {
	var fmsg = "[spreax" + (!isWarn ? ' error' : '') + "] " + msg;
	if (isWarn) { console.warn(fmsg); }
	else { throw new Error(fmsg); }
}
function domError(msg, el, isWarn){
	error((msg + "\n -------\n(at " + (generateSelector(el)) + ")"), isWarn);
}

function getTextNodes(el) {
	var n = [];
	for (var i = 0, list = el.childNodes; i < list.length; i += 1) {
		var node = list[i];
		var type = node.nodeType;
		if (type === document.TEXT_NODE) {
			n.push(node);
		} else if (type === document.ELEMENT_NODE) {
			n = n.concat( getTextNodes(node));
		}
	}
	return n.filter(function (e) {
		return /\S+/g.test(e.textContent);
	});
}

function trim(str) {
	return str.replace(/\{ /g, '').replace(/ \}/g, '');
}
function contains(str){
	return /\{ \w+(?: \| \w+)* \}/gi.test(str);
}
var global = /\{ \w+(?: \| \w+)* \}/gi;

var _registry = {};
function register(name, callback, argState) {
	if ( argState === void 0 ) argState = 'optional';
	if (name in _registry) { error(("directive \"" + name + "\" already exists")); }
	if (!['optional', 'empty', 'required'].includes(argState)) { error(("argument state for directive \"" + name + "\" is not valid. choosing the default value (\"optional\")"), true); }
	if (!/^[a-z]+(?:-[a-z]+)*$/.test(name)) { error(("\"" + name + "\" is not a valid directive name")); }
	_registry[name] = {
		argState: argState, callback: callback
	};
}
var all = _registry;

register('on', function(el, value, modifiers, arg) {
	var this$1 = this;
	var sh_reg = / = (.*)$/;
	var ref = value.match(sh_reg) || [];
	var shortcut = ref[1];
	var hasShortcut = !!shortcut,
	pureValue = value.replace(sh_reg, '');
	el.addEventListener(arg, function (event) {
		if (modifiers.prevent) { event.preventDefault(); }
		if (hasShortcut) {
			var v;
			if (/^(['"`]).*\1$/.test(shortcut)) { v = shortcut.slice(1, -1); }
			else if (shortcut === 'null') { v = null; }
			else if (shortcut === 'true') { v = true; }
			else if (shortcut === 'false') { v = false; }
			else if (shortcut === '!0') { v = true; }
			else if (shortcut === '!1') { v = false; }
			else if (!isNaN(Number(shortcut)) && shortcut !== 'Infinity') { v = Number(shortcut); }
			else { v = this$1[shortcut]; }
			this$1[pureValue] = v;
		} else {
			this$1[value]();
		}
	}, {
		once: modifiers.once,
		passive: modifiers.passive,
		capture: modifiers.capture,
	});
}, 'required');

register('model', {
	ready: function ready(el, value, ref) {
		var this$1 = this;
		var lazy = ref.lazy;
		if (!/^(?:select|input|textarea)$/.test(el.tagName.toLowerCase())) { domError("model directive only works on input, textarea or select tags", el); }
		if (el.type === 'checkbox') {
			el.checked = !!this[value];
		} else {
			el.value = this[value];
		}
		el.addEventListener('change', function () {
			var v = el.value;
			if (el.type === 'checkbox') { v = el.checked; }
			this$1[value] = v;
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
		var prop = 'value';
		if (el.type === 'checkbox') { prop = 'checked'; }
		if (el[prop] !== this[value]) { el[prop] = this[value]; }
	}
}, 'empty');

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
}, 'required');

function record(keys, value){
	var o = {};
	keys.forEach(function (k) {
		o[k] = value;
	});
	return o;
}

function directivesOf(el) {
	return Array.from(el.attributes)
		.map(function (e) { return e.name; })
		.filter(function (e) { return /^sp-/.test(e); })
		.map(function (e) { return e.replace(/^sp-/, ''); })
		.map(function (e) {
			var ref = e.match(/^([a-z]+(?:-[a-z]+)*)(:[a-z0-9]+)?((?:\.[a-z0-9]+))*$/);
			var name = ref[1];
			var arg = ref[2];
			var modifiers = ref[3];
			if (arg) { arg = arg.replace(/^:/, ''); }
			if (modifiers) {
				modifiers = record(modifiers.split('.').filter(Boolean), true);
			} else { modifiers = {}; }
			return { name: name, arg: arg, modifiers: modifiers };
		}).filter(function (e, index, arr) {
			var getFullName = function (e) { return e.arg ? [e.name, e.arg].join(':') : e.name; },
			fullName = getFullName(e),
			withThisFullName = arr.filter(function (e) { return getFullName(e) === fullName; });
			if (withThisFullName.length > 1) {
				domError(("duplicate directive " + (e.name)), el, true);
				return withThisFullName[0];
			} else { return e; }
		});
}

function toString(d){
	var o = "sp-" + (d.name);
	if (d.arg) { o += ':' + d.arg; }
	var k = Object.keys(d.modifiers);
	if (k.length) { o += '.' + k.join('.'); }
	return o;
}

function makeFormatterFn(formatters, source) {
	if (!formatters.length) { return function (v) { return v; }; }
	return formatters.map(function (f) {
		if (!(f in source)) { error(("formatter " + f + " not found")); }
		else { return source[f]; }
	}).reduce(function (a, b) { return function (arg) { return b(a(arg)); }; });
}

var Spreax = function Spreax(el, options) {
	if (!(this instanceof Spreax)) { error('Spreax must be called with new operator'); }
	if (typeof el === 'string') {
		this.$el = document.querySelector(el);
	} else if (el instanceof HTMLElement) {
		this.$el = el;
	} else {
		error(("wrong selector or element: expected element or string, got \"" + (String(el)) + "\""));
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
			if (!obj.hasOwnProperty(key)) { error(("unknown state property \"" + key + "\"")); }
			return obj[key];
		},
		set: function (obj, key, value) {
			if (!obj.hasOwnProperty(key)) { error(("unknown state property \"" + key + "\"")); }
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
	if (!el.attributes || !el.attributes.length) { return; }
	var loop = function () {
		var ref = list[i];
			var name = ref.name;
			var arg = ref.arg;
			var modifiers = ref.modifiers;
			var dir = all[name];
		if (dir === undefined) { domError(("directive \"" + name + "\" not found"), el); }
		switch (dir.argState) {
			case 'empty':
				if (!!arg) { domError(("directive \"" + name + "\" needed no arguments, but there is an argument"), el); }
				break;
			case 'required':
				if (!arg) { domError("directive needs an arguments, but there's nothing", el); }
				break;
		}
		var attrValue = el.getAttribute(toString({ name: name, arg: arg, modifiers: modifiers })),
			argArray = [el, attrValue, modifiers, arg];
		if (typeof dir.callback === 'function') {
			dir.callback.apply(this$1, argArray);
		} else {
			if ('ready' in dir.callback) { dir.callback.ready.apply(this$1, argArray); }
			if ('updated' in dir.callback) {
				this$1.$on('', function () {
					dir.callback.updated.apply(this$1, argArray);
				}, {
						type: 'DIRECTIVE',
						id: el
					});
			}
		}
	};
		for (var i = 0, list = directivesOf(el); i < list.length; i += 1) loop();
};
Spreax.prototype.$interpolation = function $interpolation () {
	getTextNodes(this.$el).forEach(this.$interpolateNode, this);
};
Spreax.prototype.$interpolateNode = function $interpolateNode (node) {
		var this$1 = this;
	if (!contains(node.textContent)) { return; }
	var exps = node.textContent.match(global)
		.map(trim)
		.filter(function (item, index, array) { return array.indexOf(item) === index; });
	var initText = node.textContent;
	var loop = function () {
		var exp = list[i];
			var ref = exp.split(' | ');
			var prop = ref[0];
			var formatters = ref.slice(1);
			var reg = new RegExp(("\\{ " + (exp.replace(/\|/g, '\\|')) + " \\}"), 'g'),
		formatterFn = this$1.$pipeFormatters(formatters);
		this$1.$on(prop, function (v) {
			var replaced = initText.replace(reg, formatterFn(v));
			if (node.textContent !== replaced) { node.textContent = replaced; }
		}, {
				immediate: true,
				type: 'INTERPOLATION',
				id: node
			});
	};
		for (var i = 0, list = exps; i < list.length; i += 1) loop();
};
Spreax.prototype.$observe = function $observe () {
		var this$1 = this;
	var m = new MutationObserver(function (muts) {
		for (var i$2 = 0, list$2 = muts; i$2 < list$2.length; i$2 += 1) {
			var ref = list$2[i$2];
				var addedNodes = ref.addedNodes;
				var removedNodes = ref.removedNodes;
				for (var i = 0, list = addedNodes; i < list.length; i += 1) {
				var anode = list[i];
					switch (anode.nodeType) {
					case document.TEXT_NODE:
						this$1.$interpolateNode(anode);
						break;
					case document.ELEMENT_NODE:
						getTextNodes(anode).forEach(this$1.$interpolateNode, this$1);
						this$1.$execDirectives(anode);
						break;
				}
			}
			for (var i$1 = 0, list$1 = removedNodes; i$1 < list$1.length; i$1 += 1) {
				var rnode = list$1[i$1];
					var removeNodeFromEvents = function (node, type) {
						if ( type === void 0 ) type = 'INTERPOLATION';
					this$1.$events.filter(function (e) {
						return e.type === type && e.id === node;
					}).map(function (e) { return this$1.$events.indexOf(e); }).forEach(function (i) {
						this$1.$events.splice(i, 1);
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
};
Spreax.prototype.$on = function $on (key, fn, options) {
		if ( options === void 0 ) options = {};
	this.$events.push({
		key: key,
		fn: fn,
		type: options.type,
		id: options.id,
	});
	if (options.immediate) { this.$emit(key); }
};
Spreax.prototype.$emit = function $emit (key) {
		var this$1 = this;
	this.$events.filter(function (ev) {
		return key ? ev.key === key : true;
	}).forEach(function (ev) {
		var args = ev.key ? [this$1[ev.key]] : [];
		ev.fn.apply(this$1, args);
	});
};
Spreax.directive = register;

export default Spreax;
