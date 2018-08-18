var Hdash = (function () {
	'use strict';

	function error(msg, isWarn) {
		var fmsg = "[hdash" + (!isWarn ? ' error' : '') + "] " + msg;
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
	function register(name, fn){
		name = name.toLowerCase();
		if (!/^[a-z]+(?:-?\*)?$/.test(name)) { error(("invalid directive name \"" + name + "\"; only a-z and numbers, wildcard at end (could be seperated with a hyphen)")); }
		var expression = new RegExp('^' + name.replace(/\*$/, '([a-z]+)') + '$');
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
		var parsed = parse(el.getAttribute('h-' + name));
		d.fn.bind(ins)(el, Object.assign({}, parsed,
			{wildcard: name.match(d.expression)[1]}));
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
	});

	register('model', function(el, binding) {
		var this$1 = this;
		if (!/^(?:INPUT|TEXTAREA)$/.test(el.tagName)) { error('<input> or <textarea> required for "model" directive'); }
		var prop = binding.value;
		var eventName = binding.modifiers.lazy ? 'change' : 'keydown';
		el.addEventListener(eventName, function () {
			setTimeout(function () {
				var v = el.value,
				isNumberInput = el.type === 'number';
				if (isNumberInput) { v = Number(v); }
				if (binding.modifiers.trim && !isNumberInput) { v = v.trim(); }
				if (v !== this$1.state[prop]) { this$1.state[prop] = v; }
			}, 0);
		});
		this.$_onChange(prop, function (v) {
			el.value = v;
		}, true);
	});

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

	register('on*', function(el, binding) {
		var this$1 = this;
		var eventName = binding.wildcard;
		if (!isValidEvent(eventName)) { error(("event \"" + (binding.value) + "\" is not a valid DOM event")); }
		var isKeyboardEvent = /^key(?:down|up|press)$/.test(eventName);
		el.addEventListener(eventName, function (e) {
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
	});

	register('class-*', function(el, ref){
		var value = ref.value;
		var wildcard = ref.wildcard;
		this.$_onChange(value || wildcard, function (b) {
			el.classList[!b ? 'remove' : 'add'](wildcard);
		}, true);
	});

	var Hdash = function Hdash(el, options) {
		if (typeof el === 'string') {
			this.el = document.querySelector(el);
		} else if (el instanceof HTMLElement) {
			this.el = el;
		} else {
			error(("wrong selector or element: expected element or string, got " + (String(el))));
		}
		this.state = options.state || {};
		this.actions = options.actions || {};
		this.watchers = options.watchers || {};
		this.$_events = {};
		this.$_init();
	};
	Hdash.prototype.$_initProxy = function $_initProxy () {
			var this$1 = this;
		this.state = new Proxy(this.state, {
			get: function (obj, key) {
				if (key in obj) { return obj[key] }
				else { error(("unknown state property \"" + key + "\"")); }
			},
			set: function (obj, key, value) {
				if (!(key in obj)) { error(("unknown state property \"" + key + "\"")); }
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
		Object.keys(this.watchers).forEach(function (k) {
			this$1.$_onChange(k, this$1.watchers[k].bind(this$1));
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
				exec(dir.replace(/^h-/, ''), this$1, el);
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

	return Hdash;

}());
