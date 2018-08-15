/**
 * @param {string} str 
 * @returns {string}
 */
export default function camel(str){
	return str.replace(/-(.)/g, ($, next) => {
		return /[a-z]/.test(next) ? next.toUpperCase() : next
	})
}