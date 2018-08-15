import error from '../error'
import parse from './parse'

const alld = []

/**
 * @typedef {Object} Bindings
 * @property {string} value
 * @property {string} [wildcard]
 * @property {{[x: string]: true}} [modifiers]
 * @param {string} name 
 * @param {(el: Element, bindings: Bindings) => void} fn 
 */
export function register(name, fn){
	name = name.toLowerCase()
	if (!/^[a-z]+(?:-?\*)?$/.test(name)) error(`invalid directive name "${name}"`)
	const expression = new RegExp(name.replace(/\*$/, '([a-z]+)') + '$')

	const d = {
		name,
		expression,
		fn,
	}
	alld.push(d)
}

/**
 * @param {string} name 
 * @param ins 
 * @param {Element} el 
 */
export function exec(name, ins, el){
	let d = null
	for (let i = 0, l = alld.length; i < l; i++) {
		if (alld[i].expression.test(name)) {
			d = alld[i]
			break
		} 
	}
	if (d === null) error(`directive "${name}" not found`)

	let parsed = parse(el.getAttribute('r-' + name))

	d.fn.bind(ins)(el, {
		...parsed,
		wildcard: name.match(d.expression)[1],
	})
}

export function getAll(){
	return alld
}