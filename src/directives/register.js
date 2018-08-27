import error from "../error"

/**
 * @type {{[x: string]: {callback: Callback, argState: ArgState}}}
 */
const _registry = {}

/**
 * @typedef {{[x: string]: true}} Modifiers
 * @typedef {(el: Element, value: string, modifiers: Modifiers, arg?: string) => void} fn
 * @typedef {(fn | { ready?: fn, updated?: fn })} Callback
 * @typedef {('required'|'optional'|'empty')} ArgState
 */

/**
 * @param {string} name 
 * @param {Callback} callback 
 * @param {ArgState} [argState]
 */
export function register(name, callback, argState = 'optional') {
	if (name in _registry) error(`directive "${name}" already exists`)
	if (!['optional', 'empty', 'required'].includes(argState)) error(`argument state for directive "${name}" is not valid. choosing the default value ("optional")`, true)
	if (!/^[a-z]+(?:-[a-z]+)*$/.test(name)) error(`"${name}" is not a valid directive name`)

	_registry[name] = {
		argState, callback
	}
}

export const all = _registry