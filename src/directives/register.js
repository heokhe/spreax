/** @type {{[x: string]: {callback: Callback, argRequired: boolean}}} */
export const REGISTRY = {}

/**
 * @typedef {object} DirectiveCallbackArg
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
 * @param {boolean} [argRequired]
 */
export function register(name, callback, argRequired = false) {
	if (name in REGISTRY) throw new Error(`directive "${name}" already exists`)
	if (!/^[a-z]+(?:-[a-z]+)*$/.test(name)){
		throw new Error(`"${name}" is not a valid directive name`)
	}	

	REGISTRY[name] = { argRequired, callback }
}