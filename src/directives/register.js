/**
 * @typedef {Object} DirectiveOptions
 * @property {boolean} [argumentIsRequired]
 */

/** @type {{[x: string]: {callback: Callback, options: DirectiveOptions}}} */
const _registry = {}

/**
 * @typedef {Object} DirectiveCallbackArg
 * @property {Object<string, true>} modifiers
 * @property {Element} element
 * @property {string} attributeValue
 * @property {string} argument
 * @typedef {(arg: DirectiveCallbackArg) => void} fn
 * @typedef {(fn | { ready?: fn, updated?: fn })} Callback
 */

/**
 * @param {string} name 
 * @param {Callback} callback 
 * @param {DirectiveOptions} [options]
 */
export function register(name, callback, options = {}) {
	if (name in _registry) throw new Error(`directive "${name}" already exists`)
	if (!/^[a-z]+(?:-[a-z]+)*$/.test(name)){
		throw new Error(`"${name}" is not a valid directive name`)
	}	

	_registry[name] = { options, callback }
}

export const all = _registry