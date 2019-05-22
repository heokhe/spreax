var Spreax = (function () {
  var ELEMENT_NODE = Node.ELEMENT_NODE;
  var TEXT_NODE = Node.TEXT_NODE;
  function getAllNodes(el) {
    return Array.from(el.childNodes)
      .filter(function (node) { return [ELEMENT_NODE, TEXT_NODE].includes(node.nodeType); })
      .map(function (node) { return [node ].concat( getAllNodes(node)); }).flat(Infinity);
  }

  var joinTwo = function (a, b) {
    var s = '';
    for (var i = 0; i < a.length; i++) {
      s += a[i];
      if (i in b) {
        s += b[i];
      }
    }
    return s;
  };
  var getDeep = function (object, path) { return path.reduce(function (a, b) { return a[b]; }, object); };
  var setDeep = function (object, path, value) {
    getDeep(object, path.slice(0, -1))[path[path.length - 1]] = value;
  };

  function extract(text) {
    var reg = /\[\[ (?:\w+\.)*\w+ \]\]/g;
    var vars = (text.match(reg) || []).map(function (v) { return v.slice(3, -3); });
    var others = text.split(reg);
    return {
      vars: vars,
      render: function (ctx) { return joinTwo(others, vars.map(function (e) { return getDeep(ctx, e.split('.')); })); },
    };
  }

  function parseLiteral (lit) {
    var done = function (v) { return ({ done: true, value: v }); };
    if (/^\d+(?:\.\d*)?$/.test(lit)) {
      return done(+lit);
    } if (/^(['"`]).*\1$/.test(lit)) {
      return done(lit.slice(1, -1));
    } if (/^:[a-z]*$/.test(lit)) {
      return done(lit.slice(1));
    } if (lit === 'true') {
      return done(true);
    } if (lit === 'false') {
      return done(false);
    } if (lit === 'undefined') {
      return done(undefined);
    } if (lit === 'null') {
      return done(null);
    } if (lit === 'Infinity') {
      return done(Infinity);
    }
    return { done: false };
  }

  function parseExpression(expr) {
    expr = expr.trim();
    if (expr[0] === '!') {
      var parsed = parseExpression(expr.slice(1));
      if (parsed.type === 'action' && !parsed.isMethod) { return null; }
      return {
        type: 'literal',
        fn: function (ctx) { return !parsed.fn(ctx); },
      };
    }
    var lit = parseLiteral(expr);
    if (lit.done) {
      return {
        type: 'literal',
        fn: function () { return lit.value; },
      };
    }
    var ref = expr.match(/^(?:[a-z_]+\.)*[a-z_]+$/i) || [];
    var property = ref[0];
    if (property) {
      var path = property.split('.');
      return {
        type: 'property',
        property: property,
        path: path,
        fn: function (ctx) { return getDeep(ctx, path); },
      };
    }
    var ref$1 = expr.match(/^([a-z_]\w+)\(\)$/i) || [];
    var method = ref$1[1];
    if (method) {
      return {
        type: 'action',
        isMethod: true,
        fn: function (ctx) { return ctx[method](); },
      };
    }
    var stmt = expr.match(/^(.+) ?= ?(.+)$/) || [];
    if (stmt.length) {
      var ref$2 = stmt.slice(1).map(function (e) { return parseExpression(e.trim()); });
      var leftHand = ref$2[0];
      var rightHand = ref$2[1];
      if (
        leftHand.type !== 'property' || (
          rightHand.type === 'action' && !rightHand.isMethod
        )
      ) { throw new Error('da fuck'); }
      return {
        type: 'action',
        isMethod: false,
        rightHand: rightHand,
        fn: function (ctx) {
          setDeep(ctx, leftHand.path, rightHand.fn(ctx));
        },
      };
    }
    throw new Error(("unexpected expression \"" + expr + "\""));
  }

  var DIRECTIVE_REGEX = /^\[([a-z]+)(?::([a-z]+))?\]$/i;
  var getDirectives = function (el) { return Array.from(el.attributes)
    .filter(function (ref) {
      var name = ref.name;
      return DIRECTIVE_REGEX.test(name);
    })
    .map(function (ref) {
      var name = ref.name;
      var value = ref.value;
      var ref$1 = DIRECTIVE_REGEX.exec(name);
      var dname = ref$1[1];
      var param = ref$1[2];
      return { param: param, value: value, name: dname };
    }); };
  var DIRECTIVES = {};
  var Directive = function Directive(name, callback, paramRequired) {
    if ( paramRequired === void 0 ) paramRequired = false;
    this.name = name;
    this.fn = callback;
    this.paramRequired = paramRequired;
  };
  Directive.prototype.execute = function execute (instance, el, param, value) {
    if (this.paramRequired && !param) {
      throw new Error(("parameter is required for " + (this.name) + " directive"));
    }
    this.fn.call(instance, {
      element: el,
      param: param,
      rawValue: value,
      value: value ? parseExpression(value) : undefined,
    });
  };
  function register(directive) {
    var name = directive.name;
    if (name in DIRECTIVES) { throw new Error(("already registered " + name)); }
    if (!/^[a-z]+$/i.test(name)) { throw new Error((name + " is not a valid directive name")); }
    DIRECTIVES[name] = directive;
  }

  function proxy(object, callback, pathPrefix) {
    if ( pathPrefix === void 0 ) pathPrefix = [];
    var map = {};
    return new Proxy(object, {
      get: function get(o, key) {
        var value = o[key];
        if (typeof value === 'object') {
          var path = pathPrefix.concat( [key]);
          var keyMap = path.join('.');
          if (!(keyMap in map)) {
            map[keyMap] = proxy(value, callback, path);
          }
          return map[keyMap];
        }
        return value;
      },
      set: function set(o, key, value) {
        var path = pathPrefix.concat( [key]);
        var keyMap = path.join('.');
        if (keyMap in map) {
          map[keyMap] = proxy(value, callback, path);
        }
        var oldValue = o[key];
        if (oldValue === value) { return false; }
        o[key] = value;
        callback(path, oldValue, value);
        return true;
      },
    });
  }

  var on = new Directive('on', function (ref) {
    var this$1 = this;
    var element = ref.element;
    var param = ref.param;
    var value = ref.value;
    element.addEventListener(param, function () {
      if (value.type === 'action') {
        value.fn(this$1);
      }
    });
  }, true);

  var bind = new Directive('bind', function (ref) {
    var this$1 = this;
    var element = ref.element;
    var rawValue = ref.rawValue;
    var value = ref.value;
    if (value.type !== 'property' || rawValue !== value.property) { return; }
    var isNumber = element.type === 'number';
    this.$on(value.property, function () {
      element.value = value.fn(this$1);
    }, { immediate: true });
    var handleChange = function () {
      setTimeout(function () {
        var val = element.value;
        setDeep(this$1, value.path, isNumber ? +val : val);
      }, 0);
    };
    element.addEventListener('keydown', handleChange);
  });

  register(on);
  register(bind);
  register(new Directive('if', function (ref) {
    var this$1 = this;
    var element = ref.element;
    var value = ref.value;
    var parent = element.parentElement;
    var comment = document.createComment(element.tagName.toLowerCase() + +new Date());
    element.before(comment);
    this.$on('*', function () {
      if (value.fn(this$1)) {
        if (!parent.contains(element)) {
          comment.after(element);
        }
      } else {
        element.remove();
      }
    }, { immediate: true });
  }));
  register(new Directive('attr', function (ref) {
    var this$1 = this;
    var element = ref.element;
    var value = ref.value;
    var param = ref.param;
    this.$on('*', function () {
      element.setAttribute(param, value.fn(this$1));
    }, { immediate: true });
  }));

  var Spreax = function Spreax(ref) {
    var this$1 = this;
    var el = ref.el;
    var state = ref.state;
    var methods = ref.methods;
    el._sp = this;
    this.$el = el;
    this.$events = [];
    this.$state = proxy(state, function (path) {
      this$1.$emit('*');
      this$1.$emit(path.join('.'));
    });
    var loop = function () {
      var key = list[i];
      Object.defineProperty(this$1, key, {
        get: function () { return this$1.$state[key]; },
        set: function (v) { this$1.$state[key] = v; },
      });
    };
    for (var i = 0, list = Object.keys(this$1.$state); i < list.length; i += 1) loop();
    for (var i$1 = 0, list$1 = Object.keys(methods); i$1 < list$1.length; i$1 += 1) {
      var key$1 = list$1[i$1];
      this$1[key$1] = methods[key$1].bind(this$1);
    }
    getAllNodes(el).forEach(function (n) { return this$1.$handleNode(n); });
  };
  Spreax.prototype.$handleNode = function $handleNode (target) {
      var this$1 = this;
    if (target.nodeName === '#text') {
      var text = target.textContent;
      if (/^\s*$/.test(text)) { return; }
      var template = extract(text);
      for (var i = 0, list = template.vars; i < list.length; i += 1) {
        var v = list[i];
          this$1.$on(v, function () {
          target.textContent = template.render(this$1.$state);
        }, { immediate: true });
      }
    } else {
      for (var i$1 = 0, list$1 = getDirectives(target); i$1 < list$1.length; i$1 += 1) {
        var ref = list$1[i$1];
          var value = ref.value;
          var name = ref.name;
          var param = ref.param;
          if (name in DIRECTIVES) {
          DIRECTIVES[name].execute(this$1, target, param, value);
        }
      }
    }
  };
  Spreax.prototype.$on = function $on (key, callback, ref) {
      if ( ref === void 0 ) ref = {};
      var immediate = ref.immediate; if ( immediate === void 0 ) immediate = false;
    var id = this.$events.push({ key: key, fn: callback.bind(this) }) - 1;
    if (immediate) { this.$emit(id); }
  };
  Spreax.prototype.$emit = function $emit (keyOrId) {
    var events = this.$events;
    events.filter(function (ev, i) {
      if (keyOrId === '*') { return true; }
      return (typeof keyOrId === 'number' ? i : ev.key) === keyOrId;
    }).forEach(function (event) {
      event.fn();
    });
  };

  return Spreax;

}());
