/**
 * @param {string} str 
 * @returns {string}
 */
export default function(str){
	return str.replace(/-([a-z])/g, ($, next) => next.toUpperCase());
}