var Ryo = (function () {
	'use strict';

	function error$1(msg, isWarn) {
		var fmsg = "[ryo" + (!isWarn ? ' error' : '') + "] " + msg;
		if (isWarn) { console.warn(fmsg); }
		else { throw new Error(fmsg) }
	}

	var alld = [];
	function register(name, fn){
		name = name.toLowerCase();
		if (!/^[a-z]+(?:-?\*)?$/.test(name)) { error$1(("invalid directive name \"" + name + "\"")); }
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
		for (var i = 0; i < length; i++) {
			if (alld[i].expression.test(name.toLowerCase())) {
				d = alld[i];
				break
			}
		}
		if (d === null) { error$1(("directive \"" + name + "\" not found")); }
		var match = name.match(d.expression),
		hasWildcard = match.length > 1,
		wildCardValue = match[1],
		attrObject = el.attributes.getNamedItem('r-' + name);
		d.fn.bind(ins)(el, attrObject, wildCardValue);
	}

	function sanitizeHTML(html){
		return html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
	}

	register('text', function(el, attr) {
		var this$1 = this;
		var val = attr.value;
		var setText = function (el, t) {
			if (typeof t === 'string') { t = sanitizeHTML(t).replace(/ /g, '&nbsp;'); }
			el.innerHTML = t;
		};
		if (!!val) {
			this.$_onChange(val, function (t) {
				setText(el, t);
			}, true);
		} else {
			var pattern = /\{\{([a-z0-9_$]+)\}\}/gi,
			toFormatElement = function (el) { return pattern.test(el.innerHTML); };
			var children = Array.from(el.querySelectorAll('*')).filter(toFormatElement);
			children.forEach(function (ch) {
				ch.innerHTML.replace(pattern, function ($$, $1) {
					this$1.$_onChange($1, function (t) {
						setText(ch, t);
					}, true);
				});
			});
		}
	});

	register('sync', function(el, attr) {
		var this$1 = this;
		if (!/^(?:INPUT|TAGNAME)$/.test(el.tagName)) { error('<input> or <textarea> required for "sync" directive'); }
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

	function parseAttribute(attr){
		var R = /^([a-z0-9$_"]+)((?: ?#[a-z0-9]+)+)?$/i;
		var ref = R.exec(attr.value);
		var value = ref[1];
		var m = ref[2];
		var modifiers = {};
		if (typeof m !== 'undefined') { m.split('#').filter(function (e) { return !!e.trim(); }).map(function (e) { return e.trim(); }).forEach(function (m) {
			modifiers[m] = true;
		}); }
		return {
			name: attr.name,
			value: value,
			originalValue: attr.value,
			modifiers: modifiers
		}
	}
	register('on*', function(el, attr, wcv){
		attr = parseAttribute(attr);
		console.log(attr);
		el.addEventListener(wcv, function (e) {
			attr.modifiers.prevent && e.preventDefault();
		}, {
			once: attr.modifiers.once,
			passive: attr.modifiers.passive,
			capture: attr.modifiers.capture,
		});
	}, true);

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
			error$1('wrong selector or element: expected element or string');
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
				else { error$1(("property " + key + " does'nt exist in state.")); }
			},
			set: function (obj, key, value) {
				if (!(key in obj)) { error$1(("property \"" + key + "\" does'nt exist in state.")); }
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
					var name = dir.replace(/:.*$/, '').replace(/^r-/, '');
					exec(name, this$1, el);
				});
		});
	};

	return Ryo;

}());
