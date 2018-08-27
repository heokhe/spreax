/**
 * @param {Element} el 
 * @typedef {Object} attrib
 * @property {string} name
 * @property {string} arg
 * @returns {attrib[]}
 */
export default function({attributes}) {
	return Array.from(attributes)
		.map(e => e.name)
		.filter(e => /^h-/.test(e))
		.map(e => e.replace(/^h-/, ''))
		.map(e => {
			let [, name, arg] = e.match(/^([a-z]+(?:-[a-z0-9]+)*)(:[a-z0-9]+)?$/)
			if (arg) arg = arg.replace(/^:/, '')
			return { name, arg }
		})
}