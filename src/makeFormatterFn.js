/**
 * @param {string[]} formatters 
 * @param {{[x: string]: (arg: *) => *}} source 
 * @returns {(a: *) => *}
 */
export default function(formatters, source) {
	if (!formatters.length) return v => v
	return formatters.map(f => {
		if (!source.hasOwnProperty(f)) throw new Error(`formatter "${f}" not found`)
		else return source[f]
	}).reduce((a, b) => c => b(a(c)))
}