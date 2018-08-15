let list = []

/**
 * Checks if given event name is a valid one.
 * @param {string} event
 * @returns {boolean}
 */
export default function isValidEvent(event){
	if (list.length === 0) list = Object.keys(window).filter(e => /^on/.test(e)).map(e => e.replace(/^on/, ''))
	return list.includes(event)
}