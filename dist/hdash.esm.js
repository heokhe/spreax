function generateSelectorString(el, root) {
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
		return selector
	});
	return pathSections.join(' > ')
}

function error$1(msg, isWarn) {
	var fmsg = "[hdash" + (!isWarn ? ' error' : '') + "] " + msg;
	if (isWarn) { console.warn(fmsg); }
	else { throw new Error(fmsg) }
}
function domError(msg, el){
	error$1(msg + "\n -------\n(at " + (generateSelectorString(el)) + ")");
}

function record(keys, value){
	var o = {};
	keys.forEach(function (k) {
		o[k] = value;
	});
	return o
}

function camel(str){
	return str.replace(/-(.)/g, function ($, next) {
		return /[a-z]/.test(next) ? next.toUpperCase() : next
	})
}

function parse(attr) {
	var reg = /((?: --(?:(?:[a-z]+-)*[a-z0-9]+)+)+)$/,
	value = attr.replace(reg, ''),
	modString = reg.exec(attr),
	modObject = {};
	modString = modString === null ? null : modString[0];
	if (modString !== null) {
		var modKeys = modString.split(' --').filter(function (e) { return !!e; }).map(camel);
		modObject = record(modKeys, true);
	}
	return {
		value: value,
		modifiers: modObject
	}
}

var alld = [];
function register(name, fn, arg){
	if ( arg === void 0 ) arg = 1;
	if (!/^[a-z]+$/.test(name)) { error$1(("invalid directive name \"" + name + "\"; only a-z and numbers are accepted")); }
	alld.push({
		name: name, fn: fn, arg: arg
	});
}
function exec(name, arg, ins, el){
	var d = null;
	for (var i = 0, l = alld.length; i < l; i++) {
		if (alld[i].name === name) {
			d = alld[i];
			break
		}
	}
	if (d === null) { error$1(("directive \"" + name + "\" not found")); }
	switch (d.arg){
		case 0:
			if (!!arg) { error$1(("no argument is accepted for directive \"" + name + "\" (got \"" + arg + "\")")); }
			break
		case 2:
			if (!arg) { error$1(("argument is required for directive \"" + name + "\"")); }
			break
	}
	var attrName = 'h-' + (!!arg ? (name + ":" + arg) : name),
	parsed = parse(el.getAttribute(attrName));
	d.fn.call(ins, el, Object.assign({}, parsed,
		{arg: arg}));
}

function sanitizeHTML(html) {
	return html.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/"/g, '&quot;')
}

function arrayUnique(arr){
	return arr.filter(function (elem, pos, _arr) { return arr.indexOf(elem) === pos; })
}

register('text', function(el, ref) {
	var this$1 = this;
	var value = ref.value;
	if (!!value) {
		this.$_onChange(value, function (text) {
			text = String(text);
			text = sanitizeHTML(text).replace(/  /g, '&nbsp;&nbsp;').replace(/\n/g, '<br>');
			el.innerHTML = text;
		}, true);
	} else {
		var REG = /\{\{\w+\}\}/gi,
		removeBraces = function (p) { return p.replace(/^\{\{/, '').replace(/\}\}$/, ''); };
		var els = Array.from(el.children);
		els.unshift(el);
		els.forEach(function (el) {
			Array.from(el.childNodes)
				.filter(function (n) { return n.nodeType === 3; })
				.filter(function (n) { return !!n.textContent.trim(); })
				.filter(function (n) { return REG.test(n.textContent); })
				.forEach(function (node) {
					var text = node.textContent,
					usedProps = arrayUnique(text.match(REG).map(removeBraces));
					usedProps.forEach(function (prop) {
						this$1.$_onChange(prop, function (v) {
							node.textContent = text.replace(new RegExp('\\{\\{' + prop + '\\}\\}', 'g'), v);
						}, true);
					});
				});
		});
	}
}, 0);

register('model', function(el, ref) {
	var this$1 = this;
	var value = ref.value;
	var modifiers = ref.modifiers;
	if (!/^(?:INPUT|TEXTAREA)$/.test(el.tagName)) { domError('<input> or <textarea> required for "model" directive', el); }
	var eventName = modifiers.lazy ? 'change' : 'keydown';
	el.addEventListener(eventName, function () {
		setTimeout(function () {
			var v = el.value,
			isNumberInput = el.type === 'number';
			if (isNumberInput) { v = Number(v); }
			if (modifiers.trim && !isNumberInput) { v = v.trim(); }
			if (v !== this$1.state[value]) { this$1.state[value] = v; }
		}, 0);
	});
	this.$_onChange(value, function (v) {
		el.value = v;
	}, true);
}, 0);

var list = [];
function isValidEvent(event){
	if (list.length === 0) { list = Object.keys(window).filter(function (e) { return /^on/.test(e); }).map(function (e) { return e.replace(/^on/, ''); }); }
	return list.includes(event)
}

function keyboardEvent(ev){
	var alt = ev.altKey,
		shift = ev.shiftKey,
		ctrl = ev.ctrlKey,
		meta = ev.metaKey,
		key = ev.which;
	return {
		alt: alt,
		shift: shift,
		ctrl: ctrl,
		meta: meta,
		key: key
	}
}

register('on', function(el, binding) {
	var this$1 = this;
	if (!isValidEvent(binding.arg)) { domError(("event " + (binding.arg) + " is not a valid DOM event."), el); }
	var isKeyboardEvent = /^key(?:down|up|press)$/.test(binding.arg);
	el.addEventListener(binding.arg, function (e) {
		binding.modifiers.prevent && e.preventDefault();
		var SHORTCUT_REGEXP = /(?:--|\+\+|[`"']|!|:null)$/;
		var prop = binding.value,
		shortcut = prop.match(SHORTCUT_REGEXP),
		isAction = shortcut === null;
		shortcut = shortcut === null ? null : shortcut[0];
		if (isKeyboardEvent) {
			var kb = keyboardEvent(e);
			var RESERVED_KEYS = {
				backspace: 8,
				tab: 9,
				enter: 13,
				shift: 16,
				ctrl: 17,
				alt: 18,
				capslock: 20,
				esc: 27,
				pageup: 33,
				pagedown: 34,
				end: 35,
				home: 36,
				left: 37,
				up: 38,
				right: 39,
				down: 40,
				insert: 45,
				delete: 46
			};
			var key = Object.keys(binding.modifiers).filter(function (e) { return /^key/.test(e); }).map(function (e) { return e.replace(/^key/, '').toLowerCase(); });
			if (!!key.length) { key = kb.key; }
			else { key = key[0]; }
			if (key.length > 1) { error(("more than one keys are declared for " + eventName), true); }
			if (/^[a-z]$/.test(key)) { key = key.charCodeAt(0) - 32; }
			if (key in RESERVED_KEYS) { key = RESERVED_KEYS[key]; }
			if (
				key != kb.key ||
				'shift' in binding.modifiers !== kb.shift ||
				'alt' in binding.modifiers !== kb.alt ||
				'meta' in binding.modifiers !== kb.meta ||
				'ctrl' in binding.modifiers !== kb.ctrl
			) { return }
		}
		if (isAction) {
			this$1.actions[prop](e);
		} else {
			prop = prop.replace(SHORTCUT_REGEXP, '');
			if (/'|"|`/.test(shortcut)) { return this$1.state[prop] = '' }
			switch (shortcut) {
				case '-':
					this$1.state[prop]--;
					break
				case '+':
					this$1.state[prop]++;
					break
				case '!':
					this$1.state[prop] = !this$1.state[prop];
					break
				case ':null':
					this$1.state[prop] = null;
					break
			}
		}
	}, {
		once: binding.modifiers.once,
		passive: binding.modifiers.passive,
		capture: binding.modifiers.capture,
	});
}, 2);

register('class', function(el, ref){
	var value = ref.value;
	var arg = ref.arg;
	this.$_onChange(value || arg, function (b) {
		el.classList[!b ? 'remove' : 'add'](arg);
	}, true);
});

var Hdash = function Hdash(el, options) {
	if (!this instanceof Hdash) { error$1('Hdash must be called with new operator'); }
	if (typeof el === 'string') {
		this.el = document.querySelector(el);
	} else if (el instanceof HTMLElement) {
		this.el = el;
	} else {
		error$1(("wrong selector or element: expected element or string, got \"" + (String(el)) + "\""));
	}
	this.state = options.state || {};
	this.actions = options.actions || {};
	this.$_watchers = options.watchers || {};
	this.$_events = {};
	this.$_init();
};
Hdash.prototype.$_initProxy = function $_initProxy () {
		var this$1 = this;
	this.state = new Proxy(this.state, {
		get: function (obj, key) {
			if (key in obj) { return obj[key] }
			else { error$1(("unknown state property \"" + key + "\"")); }
		},
		set: function (obj, key, value) {
			if (!(key in obj)) { error$1(("unknown state property \"" + key + "\"")); }
			obj[key] = value;
			this$1.$_emit(key);
			return true
		}
	});
};
Hdash.prototype.$_emit = function $_emit (name) {
		var this$1 = this;
	if (!(name in this.$_events)) { this.$_events[name] = []; }
	this.$_events[name].forEach(function (e) {
		e(this$1.state[name]);
	});
};
Hdash.prototype.$_onChange = function $_onChange (name, fn, immediate) {
	var evs = this.$_events[name];
	if (typeof evs === 'undefined') { evs = []; }
	evs.push(fn);
	this.$_events[name] = evs;
	if (immediate) {
		this.$_emit(name);
	}
};
Hdash.prototype.$_init = function $_init () {
		var this$1 = this;
	Object.keys(this.actions).forEach(function (k) {
		this$1.actions[k] = this$1.actions[k].bind(this$1);
	});
	Object.keys(this.$_watchers).forEach(function (k) {
		this$1.$_onChange(k, this$1.$_watchers[k].bind(this$1));
	});
	this.$_initProxy();
	this.el.querySelectorAll('*').forEach(this.$_execDirectives.bind(this));
	this.$_observe();
};
Hdash.prototype.$_execDirectives = function $_execDirectives (el){
		var this$1 = this;
	Array.from(el.attributes)
		.map(function (e) { return e.name; })
		.filter(function (e) { return /^h-/.test(e); })
		.forEach(function (dir) {
			var ref = /^([a-z]+(?:-[a-z]+)*)(:(?:[a-z]+))?$/.exec(dir);
				var name = ref[1];
				var arg = ref[2];
			if (!!arg) { arg = arg.replace(/^:/, ''); }
			name = name.replace(/^h-/, '');
			exec(name, arg, this$1, el);
		});
};
Hdash.prototype.$_observe = function $_observe (){
		var this$1 = this;
	var m = new MutationObserver(function (muts) {
		muts.forEach(function (mut) {
			var added = Array.from(mut.addedNodes).filter(function (e) { return e.nodeName !== '#text'; });
			added.forEach(this$1.$_execDirectives.bind(this$1));
		});
	});
	m.observe(this.el, {
		childList: true
	});
};

Hdash.directive = register;

export default Hdash;
