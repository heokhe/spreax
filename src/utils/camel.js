/**
 * @param {string} str 
 * @returns {string}
 */
export default function camel(str){
	return str.replace(/-([a-z])/g, ($, next) => next.toUpperCase())
}