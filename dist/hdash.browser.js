var Hdash = (function () {
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

	function error(msg, isWarn) {
		var fmsg = "[hdash" + (!isWarn ? ' error' : '') + "] " + msg;
		if (isWarn) { console.warn(fmsg); }
		else { throw new Error(fmsg) }
	}
	function domError(msg, el, isWarn){
		error(msg + "\n -------\n(at " + (generateSelectorString(el)) + ")", isWarn);
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
			return /\S+/g.test(e.textContent)
		})
	}

	function arrayUnique(arr){
		return arr.filter(function (elem, pos, _arr) { return arr.indexOf(elem) === pos; })
	}

	function trim(str) {
		return str.replace(/\{ /g, '').replace(/ \}/g, '')
	}
	function contains(str){
		return /\{ \w+(?: \| \w+)* \}/gi.test(str)
	}
	var global = /\{ \w+(?: \| \w+)* \}/gi;

	function record(keys, value){
		var o = {};
		keys.forEach(function (k) {
			o[k] = value;
		});
		return o
	}

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

	register('model', {
		ready: function ready(el, value) {
			var this$1 = this;
			el.value = this.state[value];
			el.addEventListener('keydown', function () {
				setTimeout(function () {
					this$1.state[value] = el.value;
				}, 0);
			});
		},
		updated: function updated(el, value) {
			if (el.value !== this.state[value]) { el.value = this.state[value]; }
		}
	}, 'empty');

	var fn = function (el, value, mod, arg) {
		var list = el.classList,
		bool = !!this.state[value || arg];
		list[bool ? 'add' : 'remove'](arg || value);
	};
	register('class', {
		ready: fn,
		updated: fn
	}, 'required');

	register('on', function(el, value, modifiers, arg) {
		var this$1 = this;
		console.log(value);
		var sh_reg = / = (.*)$/;
		var ref = value.match(sh_reg) || [];
		var shortcut = ref[1];
		var hasShortcut = !!shortcut,
		pureValue = value.replace(sh_reg, '');
		el.addEventListener(arg, function () {
			if (hasShortcut) {
				var v;
				if (['""', "''", '``'].includes(shortcut)) { v = ''; }
				else if (shortcut === 'null') { v = null; }
				else if (shortcut === 'true') { v = true; }
				else if (shortcut === 'false') { v = false; }
				else if (shortcut === '!0') { v = true; }
				else if (shortcut === '!1') { v = false; }
				else if (!isNaN(Number(shortcut)) && shortcut !== 'Infinity') { v = Number(shortcut); }
				else { v = this$1.state[shortcut]; }
				this$1.state[pureValue] = v;
			} else {
				this$1.actions[value]();
			}
		}, {
			once: modifiers.once,
			passive: modifiers.passive,
			capture: modifiers.capture,
		});
	}, 'required');

	function directivesOf(el) {
		return Array.from(el.attributes)
			.map(function (e) { return e.name; })
			.filter(function (e) { return /^h-/.test(e); })
			.map(function (e) { return e.replace(/^h-/, ''); })
			.map(function (e) {
				var ref = e.match(/^([a-z]+(?:-[a-z]+)*)(:[a-z0-9]+)?((?:\.[a-z0-9]+))*$/);
				var name = ref[1];
				var arg = ref[2];
				var modifiers = ref[3];
				if (arg) { arg = arg.replace(/^:/, ''); }
				if (modifiers) {
					modifiers = record(modifiers.split('.').filter(Boolean), true);
				} else { modifiers = {}; }
				return { name: name, arg: arg, modifiers: modifiers }
			}).filter(function (e, index, arr) {
				var getFullName = function (e) { return e.arg ? [e.name, e.arg].join(':') : e.name; },
				fullName = getFullName(e),
				withThisFullName = arr.filter(function (e) { return getFullName(e) === fullName; });
				if (withThisFullName.length > 1) {
					domError(("duplicate directive " + (e.name)), el, true);
					return withThisFullName[0]
				} else { return e }
			})
	}

	function toString(d){
		var o = 'h-' + d.name;
		if (d.arg) { o += ':' + d.arg; }
		var k = Object.keys(d.modifiers);
		if (k.length) { o += '.' + k.join('.'); }
		return o
	}

	var Hdash = function Hdash(el, options) {
		if (!this instanceof Hdash) { error('Hdash must be called with new operator'); }
		if (typeof el === 'string') {
			this.$el = document.querySelector(el);
		} else if (el instanceof HTMLElement) {
			this.$el = el;
		} else {
			error(("wrong selector or element: expected element or string, got \"" + (String(el)) + "\""));
		}
		this.state = options.state || {};
		this.actions = options.actions || {};
		this.$watchers = options.watchers || {};
		this.$formatters = options.formatters || {};
		this.$events = [];
		this.$init();
	};
	Hdash.prototype.$init = function $init () {
			var this$1 = this;
		Object.keys(this.actions).forEach(function (k) {
			this$1.actions[k] = this$1.actions[k].bind(this$1);
		});
		Object.keys(this.$watchers).forEach(function (k) {
			this$1.$on(k, this$1.$watchers[k]);
		});
		this.$initProxy();
		this.$el.querySelectorAll('*').forEach(this.$execDirectives.bind(this));
		this.$interpolation();
		this.$observe();
	};
	Hdash.prototype.$initProxy = function $initProxy () {
			var this$1 = this;
		this.state = new Proxy(this.state, {
			get: function (obj, key) {
				if (key in obj) { return obj[key] }
				else { error(("unknown state property \"" + key + "\"")); }
			},
			set: function (obj, key, value) {
				if (!key in obj) { error(("unknown state property \"" + key + "\"")); }
				obj[key] = value;
				this$1.$emit(key);
				this$1.$emit();
				return true
			}
		});
	};
	Hdash.prototype.$execDirectives = function $execDirectives (el) {
			var this$1 = this;
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
					break
				case 'required':
					if (!arg) { domError("directive needs an arguments, but there's nothing", el); }
					break
			}
			var attrValue = el.getAttribute(toString({name: name, arg: arg, modifiers: modifiers})),
			argArray = [el, attrValue, modifiers, arg];
			if (typeof dir.callback === 'function') {
				dir.callback.apply(this$1, argArray);
			} else {
				if ('ready' in dir.callback) { dir.callback.ready.apply(this$1, argArray); }
				if ('updated' in dir.callback) {
					this$1.$on('', function () {
						dir.callback.updated.apply(this$1, argArray);
					}, {
						type: 'DIRECTIVE'
					});
				}
			}
		};
			for (var i = 0, list = directivesOf(el); i < list.length; i += 1) loop();
	};
	Hdash.prototype.$interpolation = function $interpolation () {
		getTextNodes(this.$el).forEach(this.$interpolateNode.bind(this));
	};
	Hdash.prototype.$interpolateNode = function $interpolateNode (node){
			var this$1 = this;
		if (!contains(node.textContent)) { return; }
		var exps = arrayUnique(node.textContent.match(global).map(trim));
		var initText = node.textContent;
		var loop = function () {
			var exp = list[i];
				var ref = exp.split(' | ');
				var prop = ref[0];
				var formatters = ref.slice(1);
			var reg = new RegExp('\\{ ' + exp.replace(/\|/g, '\\|') + ' \\}', 'g');
			if (formatters.length){
				formatters = formatters.map(function (e) {
					if (e in this$1.$formatters) { return this$1.$formatters[e] }
					else { error(("formatter \"" + e + "\" not found")); }
				}).reduce(function (a, b) {
					return function (arg) {
						return b(a(arg))
					}
				});
			} else {
				formatters = function (x) { return x; };
			}
			this$1.$on(prop, function (v) {
				var replaced = initText.replace(reg, formatters(v));
				if (node.textContent !== replaced) { node.textContent = replaced; }
			}, {
				immediate: true,
				type: 'INTERPOLATION',
				id: node
			});
		};
			for (var i = 0, list = exps; i < list.length; i += 1) loop();
	};
	Hdash.prototype.$observe = function $observe (){
			var this$1 = this;
		var m = new MutationObserver(function (muts) {
			muts.forEach(function (mut) {
				for (var i = 0, list = mut.addedNodes; i < list.length; i += 1) {
					var anode = list[i];
						if (anode.nodeType === document.TEXT_NODE) { this$1.$interpolateNode(anode); }
				}
				for (var i$1 = 0, list$1 = mut.removedNodes; i$1 < list$1.length; i$1 += 1) {
					var rnode = list$1[i$1];
						var removeNodeFromEvents = function (node) {
						this$1.$events.filter(function (e) {
							return e.type === 'INTERPOLATION' && e.id === node
						}).map(function (e) { return this$1.$events.indexOf(e); }).forEach(function (i) {
							this$1.$events.splice(i, 1);
						});
					};
					if (rnode.nodeType === document.TEXT_NODE) {
						removeNodeFromEvents(rnode);
					} else if (rnode.nodeType === document.ELEMENT_NODE) {
						getTextNodes(rnode).forEach(removeNodeFromEvents);
					}
				}
			});
		});
		m.observe(this.$el, {
			childList: true,
			subtree: true
		});
	};
	Hdash.prototype.$on = function $on (key, fn, options) {
		this.$events.push({
			key: key,
			fn: fn,
			type: options.type,
			id: options.id,
		});
		if (options.immediate) { this.$emit(key); }
	};
	Hdash.prototype.$emit = function $emit (key) {
			var this$1 = this;
		this.$events.filter(function (ev) {
			return key ? ev.key === key : true
		}).forEach(function (ev) {
			var args = ev.key ? [this$1.state[ev.key]] : [];
			ev.fn.apply(this$1, args);
		});
	};

	return Hdash;

}());
