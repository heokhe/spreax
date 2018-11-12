/**
 * Converts kebab-case to camelCase.
 * @param {string} str 
 * @returns {string} 
 */
export function kebabToCamel(str) {
	return str.replace(/-([a-z])/g, (_, next) => next.toUpperCase())
}

/**
 * Converts camelCase to kebab-case.
 * @param {string} str 
 * @returns {string}
 */
export function camelToKebab(str) {
	return str.replace(/[A-Z]/g, letter => '-' + letter.toLowerCase())
}