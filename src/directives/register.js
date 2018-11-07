/** @type {{[x: string]: {callback: Callback, argumentIsRequired: boolean}}} */
const _registry = {};

/**
 * @typedef {{[x: string]: true}} Modifiers
 * @typedef {(el: Element, value: string, modifiers: Modifiers, arg?: string) => void} fn
 * @typedef {(fn | { ready?: fn, updated?: fn })} Callback
 */

/**
 * @param {string} name 
 * @param {Callback} callback 
 * @param {boolean = false} argumentIsRequired
 */
export function register(name, callback, argumentIsRequired = false) {
	if (name in _registry) throw new Error(`directive "${name}" already exists`);
	if (!/^[a-z]+(?:-[a-z]+)*$/.test(name)){
		throw new Error(`"${name}" is not a valid directive name`);
	}	

	_registry[name] = { argumentIsRequired, callback };
}

export const all = _registry;