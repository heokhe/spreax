import error from '../error'
const alld = []

/**
 * @param {string} name 
 * @param {(el: Element, attr: Attr, wildCardValue?: string) => void} callback 
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
	console.log(name);
	let d = null
	for (let i = 0, l = alld.length; i < l; i++) {
		if (alld[i].expression.test(name)) {
			d = alld[i]
			break
		} 
	}
	if (d === null) error(`directive "${name}" not found`)

	const match = name.match(d.expression),
	hasWildcard = match.length > 1,
	wildCardValue = match[1],
	attrObject = el.attributes.getNamedItem('r-' + name)
	
	d.fn.bind(ins)(el, attrObject, wildCardValue)
}

export function getAll(){
	return alld
}