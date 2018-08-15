'use strict';

function error(msg, isWarn) {
	var fmsg = "[ryo" + (!isWarn ? ' error' : '') + "] " + msg;
	if (isWarn) { console.warn(fmsg); }
	else { throw new Error(fmsg) }
}

function record(keys, value){
	var o = {};
	keys.forEach(function (k) {
		o[k] = value;
	});
	return o
}

function parse(attr) {
	var reg = /((?: --[a-z]+)+)$/,
	value = attr.replace(reg, ''),
	modString = reg.exec(attr),
	modObject = {};
	modString = modString === null ? null : modString[0];
	if (modString !== null) {
		var modKeys = modString.split(' --').filter(function (e) { return !!e; });
		modObject = record(modKeys, true);
	}
	return {
		value: value,
		modifiers: modObject
	}
}

var alld = [];
function register(name, fn){
	name = name.toLowerCase();
	if (!/^[a-z]+(?:-?\*)?$/.test(name)) { error(("invalid directive name \"" + name + "\"")); }
	var expression = new RegExp(name.replace(/\*$/, '([a-z]+)') + '$');
	var d = {
		name: name,
		expression: expression,
		fn: fn,
	};
	alld.push(d);
}
function exec(name, ins, el){
	var d = null;
	for (var i = 0, l = alld.length; i < l; i++) {
		if (alld[i].expression.test(name)) {
			d = alld[i];
			break
		}
	}
	if (d === null) { error(("directive \"" + name + "\" not found")); }
	var parsed = parse(el.getAttribute('r-' + name));
	d.fn.bind(ins)(el, Object.assign({}, parsed,
		{wildcard: name.match(d.expression)[1]}));
}

function sanitizeHTML(html) {
	return html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
}

register('text', function(el, ref) {
	var value = ref.value;
	var setText = function (el) {
		return function (t) {
			if (typeof t === 'string') { t = sanitizeHTML(t).replace(/  /g, '&nbsp;&nbsp;').replace(/\n/g, '<br>'); }
			el.innerHTML = t;
		}
	};
	if (!!value) {
		this.$_onChange(value, setText(el), true);
	}
});

register('model', function(el, attr) {
	var this$1 = this;
	if (!/^(?:INPUT|TEXTAREA)$/.test(el.tagName)) { error('<input> or <textarea> required for "model" directive'); }
	var propName = attr.value;
	el.addEventListener('keydown', function () {
		setTimeout(function () {
			var isNumberInput = el.type === 'number',
			v = isNumberInput ? Number(el.value) : el.value;
			if (v !== this$1.state[propName]) { this$1.state[propName] = v; }
		}, 0);
	});
	this.$_onChange(propName, function (v) {
		el.value = v;
	}, true);
});

register('on*', function(el, bindings) {
	var this$1 = this;
	el.addEventListener(bindings.wildcard, function (e) {
		bindings.modifiers.prevent && e.preventDefault();
		var SHORTCUT_REGEXP = /(?:--|\+\+|[`"']|!)$/;
		var prop = bindings.value,
		shortcut = prop.match(SHORTCUT_REGEXP),
		isAction = shortcut === null;
		shortcut = shortcut === null ? null : shortcut[0];
		if (isAction) {
			this$1.actions[prop]();
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
			}
		}
	}, {
		once: bindings.modifiers.once,
		passive: bindings.modifiers.passive,
		capture: bindings.modifiers.capture,
	});
});

register('class-*', function(el, attr, className){
	var prop = attr.value || className;
	this.$_onChange(prop, function (b) {
		el.classList[!b ? 'remove' : 'add'](className);
	}, true);
}, true);

var Ryo = function Ryo(el, options) {
	var this$1 = this;
	if (typeof el === 'string') {
		this.el = document.querySelector(el);
	} else if (el instanceof HTMLElement) {
		this.el = el;
	} else {
		error('wrong selector or element: expected element or string');
	}
	this.state = options.state || {};
	this.actions = options.actions || {};
	Object.keys(this.actions).forEach(function (k) {
		this$1.actions[k] = this$1.actions[k].bind(this$1);
	});
	this.$_events = {};
	this.$_init();
};
Ryo.prototype.$_initStateProxy = function $_initStateProxy () {
		var this$1 = this;
	this.state = new Proxy(this.state, {
		get: function (obj, key) {
			if (key in obj) { return obj[key] }
			else { error(("property " + key + " does'nt exist in state.")); }
		},
		set: function (obj, key, value) {
			if (!(key in obj)) { error(("property \"" + key + "\" does'nt exist in state.")); }
			obj[key] = value;
			this$1.$_emit(key);
			return true
		}
	});
};
Ryo.prototype.$_emit = function $_emit (name) {
		var this$1 = this;
	if (!(name in this.$_events)) { this.$_events[name] = []; }
	this.$_events[name].forEach(function (e) {
		e(this$1.state[name]);
	});
};
Ryo.prototype.$_onChange = function $_onChange (name, fn, immediate) {
	var evs = this.$_events[name];
	if (typeof evs === 'undefined') { evs = []; }
	evs.push(fn);
	this.$_events[name] = evs;
	if (immediate) {
		this.$_emit(name);
	}
};
Ryo.prototype.$_init = function $_init () {
		var this$1 = this;
	this.$_initStateProxy();
	this.el.querySelectorAll('*').forEach(function (el) {
		Array.from(el.attributes)
			.map(function (e) { return e.name; })
			.filter(function (e) { return /^r-/.test(e); })
			.forEach(function (dir) {
				exec(dir.replace(/^r-/, ''), this$1, el);
			});
	});
};

module.exports = Ryo;
