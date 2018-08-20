import error from '../error'
import parse from './parse'

const alld = []

/**
 * @typedef {Object} Bindings
 * @property {string} value
 * @property {string} [arg]
 * @property {{[x: string]: true}} [modifiers]
 * @param {string} name 
 * @param {(el: Element, bindings: Bindings) => void} fn 
 * @param {(0|1|2)} [arg]
 */
export function register(name, fn, arg = 1){
	if (!/^[a-z]+$/.test(name)) error(`invalid directive name "${name}"; only a-z and numbers, wildcard at end (could be seperated with a hyphen)`)

	alld.push({
		name, fn, arg
	})
}

/**
 * @param {string} name 
 * @param {string} arg 
 * @param ins 
 * @param {Element} el 
 */
export function exec(name, arg, ins, el){
	let d = null
	for (let i = 0, l = alld.length; i < l; i++) {
		if (alld[i].name === name) {
			d = alld[i]
			break
		}
	}
	if (d === null) error(`directive "${name}" not found`)

	let parsed = parse(el.getAttribute('h-' + !arg ? name + ':' + arg : name))
	d.fn.call(ins, el, {
		...parsed,
		arg
	})
}

export function getAll(){
	return alld
}