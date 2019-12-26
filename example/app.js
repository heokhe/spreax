(function () {
    'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }

    /**
     * Joins two arrays into eachother.
     * @example joinTwo([1,3,5], [2,4]) // '12345'
     */
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
    var isObject = function (o) { return typeof o === 'object' && o !== null; };
    //# sourceMappingURL=utils.js.map

    function proxify(object, onSet, pathPrefix) {
        if (pathPrefix === void 0) { pathPrefix = []; }
        var map = new WeakMap();
        return new Proxy(object, {
            get: function (obj, key) {
                var value = obj[key];
                if (isObject(value)) {
                    var path = __spreadArrays(pathPrefix, [key]);
                    if (!map.has(path))
                        map.set(path, proxify(value, onSet, [key]));
                    return map.get(path);
                }
                return value;
            },
            set: function (obj, key, newValue) {
                var path = __spreadArrays(pathPrefix, [key]);
                var oldValue = obj[key];
                if (!(key in obj) && pathPrefix.length === 0)
                    return false;
                if (oldValue === newValue)
                    return true;
                if (isObject(oldValue)) {
                    map.set(path, proxify(newValue, onSet, [key]));
                    onSet(path.join('.'), newValue);
                }
                else {
                    obj[key] = newValue;
                }
                onSet(path.join('.'), newValue);
                return true;
            },
            deleteProperty: function () { return pathPrefix.length > 0; }
        });
    }

    var ELEMENT_NODE = Node.ELEMENT_NODE, TEXT_NODE = Node.TEXT_NODE;
    var isTextNode = function (n) { return n.nodeType === TEXT_NODE; };
    var isElement = function (n) { return n.nodeType === ELEMENT_NODE; };
    function getAllTextNodes(root) {
        var nodes = [];
        for (var _i = 0, _a = root.childNodes; _i < _a.length; _i++) {
            var childNode = _a[_i];
            if (isTextNode(childNode))
                nodes.push(childNode);
        }
        return nodes;
    }
    function getAllElements(root) {
        var elements = [];
        for (var _i = 0, _a = root.children; _i < _a.length; _i++) {
            var child = _a[_i];
            elements.push.apply(elements, __spreadArrays([child], getAllElements(child)));
        }
        return elements;
    }
    function getDirectives(element) {
        return __spreadArrays(element.attributes).filter(function (_a) {
            var name = _a.name;
            return name.startsWith('@');
        })
            .map(function (_a) {
            var fullName = _a.name, value = _a.value;
            var _b = fullName.slice(1).split(':', 2), name = _b[0], param = _b[1];
            return { name: name, param: param, value: value };
        });
    }
    // export const stringifyDirective = (name, param, options = {}) => {
    //   let str = `@${name}`;
    //   if (param) str += `:${param}`;
    //   for (const key in options) str += `.${key}`;
    //   return str;
    // };
    // /** @param {Element} el */
    // export function getDirectives(el) {
    //   const drctvs = Array.from(el.attributes)
    //       .filter(({ name }) => DIRECTIVE_REGEX.test(name))
    //       .map(({ name: rawName, value }) => {
    //         const [, name, param = '', optionsString = ''] = DIRECTIVE_REGEX.exec(rawName),
    //           options = Object.assign(
    //             ...optionsString.slice(1).split('.').map(k => ({ [k]: true }))
    //           ),
    //           attributeName = stringifyDirective(name, param, options);
    //         return {
    //           param,
    //           value,
    //           options,
    //           name,
    //           attributeName
    //         };
    //       }),
    //     strings = drctvs.map(({ name, param }) => stringifyDirective(name, param)),
    //     dups = getDuplicateIndexes(strings);
    //   return drctvs.map((d, i) => {
    //     if (dups.includes(i)) {
    //       // eslint-disable-next-line no-console
    //       console.warn(`found a duplicate directive "${d.attributeName}"`);
    //       return null;
    //     }
    //     return d;
    //   }).filter(Boolean);
    // }
    //# sourceMappingURL=dom.js.map

    var Context = /** @class */ (function () {
        function Context(_a) {
            var _this = this;
            var state = _a.state, parent = _a.parent, constants = _a.constants, methods = _a.methods;
            this.state = proxify(state, function (key) { return _this.emit(key); });
            this.listeners = [];
            this.childs = [];
            this.methods = methods;
            if (parent) {
                this.parent = parent;
                parent.childs.push(this);
            }
            this.constants = constants;
        }
        Context.prototype.on = function (key, callback, immediate) {
            if (immediate === void 0) { immediate = false; }
            this.listeners.push({
                name: key,
                callback: callback
            });
            if (immediate)
                callback();
        };
        Object.defineProperty(Context.prototype, "allListeners", {
            get: function () {
                return __spreadArrays(this.listeners, (this.childs.map(function (ch) { return ch.allListeners; }).flat(Infinity)));
            },
            enumerable: true,
            configurable: true
        });
        Context.prototype.get = function (key) {
            var _a, _b, _c;
            return key in this.state
                ? this.state[key]
                : ((_a = this.constants) === null || _a === void 0 ? void 0 : _a.hasOwnProperty(key)) ? (_b = this.constants) === null || _b === void 0 ? void 0 : _b[key] : (_c = this.parent) === null || _c === void 0 ? void 0 : _c.get(key);
        };
        Context.prototype.getMethod = function (method) {
            var _a;
            return method in this.methods
                ? this.methods[method]
                : (_a = this.parent) === null || _a === void 0 ? void 0 : _a.getMethod(method);
        };
        Context.prototype.set = function (key, value) {
            var _a;
            return key in this.state
                ? this.state[key] = value
                : (_a = this.parent) === null || _a === void 0 ? void 0 : _a.set(key, value);
        };
        Context.prototype.emit = function (key) {
            for (var _i = 0, _a = this.allListeners; _i < _a.length; _i++) {
                var l = _a[_i];
                if (l.name === key) {
                    l.callback();
                }
            }
        };
        return Context;
    }());
    function findContext(node) {
        if (isElement(node)) {
            var current = node;
            while (!current._ctx)
                current = current.parentElement;
            return current._ctx;
        }
        return findContext(node.parentElement);
    }
    //# sourceMappingURL=context.js.map

    var toString = function (x) { return (isObject(x) ? JSON.stringify(x) : String(x)); };
    var TEMPLATE_REGEX = /@\( *(?:[a-z_]\w*\.)*\w+ *\)/gi;
    function createTemplate(text) {
        var variables = (text.match(TEMPLATE_REGEX) || [])
            .map(function (e) { return e.slice(2, -1).trim(); }), others = text.split(TEMPLATE_REGEX);
        return {
            variables: variables,
            render: function (ctx) {
                return joinTwo(others, variables.map(function (m) {
                    return toString(toString(ctx.get(m)));
                }));
            }
        };
    }
    //# sourceMappingURL=template.js.map

    var Spreax = /** @class */ (function () {
        function Spreax(options) {
            var rootEl = options.el, state = options.state, methods = options.methods;
            this.$el = rootEl;
            this.$ctx = new Context({ state: state, methods: methods });
            this.setupElement(rootEl, new Context({
                state: {}, methods: {}, parent: this.$ctx
            }));
            for (var _i = 0, _a = getAllElements(rootEl); _i < _a.length; _i++) {
                var el = _a[_i];
                this.setupElement(el);
            }
        }
        Spreax.prototype.setupElement = function (el, context) {
            if (!el.parentElement)
                return;
            if (context)
                el._ctx = context;
            for (var _i = 0, _a = getDirectives(el); _i < _a.length; _i++) {
                var _b = _a[_i], name = _b.name, value = _b.value, param = _b.param;
                if (name === 'bind')
                    this.handleInput(el, value);
                else if (name === 'on')
                    this.handleAction(el, param, value);
                else if (name === 'each')
                    this.handleEach(el, value, param);
            }
            for (var _c = 0, _d = getAllTextNodes(el); _c < _d.length; _c++) {
                var textNode = _d[_c];
                this.setupTextNode(textNode);
            }
        };
        Spreax.prototype.setupTextNode = function (node) {
            var _a = createTemplate(node.textContent), variables = _a.variables, render = _a.render;
            if (!variables.length)
                return;
            var ctx = findContext(node);
            for (var _i = 0, variables_1 = variables; _i < variables_1.length; _i++) {
                var variable = variables_1[_i];
                ctx.on(variable, function () {
                    node.textContent = render(ctx);
                }, true);
            }
        };
        Spreax.prototype.handleInput = function (input, prop) {
            var ctx = findContext(input);
            ctx.on(prop, function () {
                return input.value = ctx.get(prop);
            }, true);
            input.addEventListener('keydown', function () {
                setTimeout(function () { return ctx.set(prop, input.value); }, 0);
            });
        };
        Spreax.prototype.handleAction = function (el, eventName, methodName) {
            var _this = this;
            var ctx = findContext(el);
            el.addEventListener(eventName, function (event) {
                var _a;
                (_a = ctx.getMethod(methodName)) === null || _a === void 0 ? void 0 : _a.call(_this);
            });
        };
        Spreax.prototype.handleEach = function (el, prop, variableName) {
            var _a;
            var array = findContext(el).get(prop);
            var child = el.firstElementChild;
            for (var i = 0; i < array.length; i++) {
                var item = array[i];
                var newChild = child.cloneNode(true);
                if (isElement(newChild)) {
                    el.appendChild(newChild);
                    this.setupElement(newChild, new Context({
                        state: {}, methods: {},
                        parent: findContext(newChild),
                        constants: (_a = {
                                i: i
                            },
                            _a[variableName] = item,
                            _a)
                    }));
                }
            }
            el.removeChild(child);
        };
        return Spreax;
    }());
    //# sourceMappingURL=index.js.map

    var app = new Spreax({
        el: document.getElementById('app'),
        state: {
            a: 2,
            b: 8,
            c: 0,
            name: 'hkh12',
            arr: [4, 5, 2, 6, 3, 7, 8]
        },
        methods: {
            log: function () {
                var _a;
                (_a = this.$ctx.state).a = Math.pow(_a.a, 2);
            }
        }
    });
    globalThis.app = app;
    //# sourceMappingURL=app.js.map

}());
