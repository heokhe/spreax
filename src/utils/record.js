/**
 * @param {string[]} keys 
 * @param {any} value 
 * @returns {{[x: string]: *}}
 */
export default function(keys, value){
	const o = {}
	keys.forEach(k => {
		o[k] = value
	})
	return o
}