import generateSelector from './dom/generateSelector'

export default class SpreaxDOMError extends Error {
	/**
	 * @extends {Error}
	 * @param {string} message 
	 * @param {Element} el 
	 */
	constructor(message, el) {
		super(`${message}\nat: ${generateSelector(el)}`)
	}
}