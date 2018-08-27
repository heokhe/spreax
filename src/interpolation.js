/**
 * @param {string} str 
 * @returns {string}
 */
export function trim(str) {
	return str.replace(/\{ /g, '').replace(/ \}/g, '')
}

export function contains(str){
	return /\{ \w+(?: \| \w+)* \}/gi.test(str)
}

export const global = /\{ \w+(?: \| \w+)* \}/gi