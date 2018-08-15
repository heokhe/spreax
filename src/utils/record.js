/**
 * @param {string[]} keys 
 * @param {any} value 
 * @returns {{[x: string]: any}}
 */
export default function record(keys, value){
	let o = {}
	keys.forEach(k => {
		o[k] = value
	})
	return o
}