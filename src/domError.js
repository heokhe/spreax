import generateSelector from './dom/generateSelector'

export default class ErrorInElement extends Error {
	/**
	 * @extends {Error}
	 * @param {string} message 
	 * @param {Element} el 
	 */
	constructor(message, el) {
		super(message)
		this.message = `${message  }\n error at: ${  generateSelector(el)}`
	}
}