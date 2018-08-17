/**
 * @typedef {Object} KBevent
 * @property {number} key
 * @property {boolean} alt
 * @property {boolean} shift
 * @property {boolean} ctrl
 * @property {boolean} meta
 * @param {KeyboardEvent} ev 
 */
export default function keyboardEvent(ev){
	const alt = ev.altKey,
		shift = ev.shiftKey,
		ctrl = ev.ctrlKey,
		meta = ev.metaKey,
		key = ev.which;

	return {
		alt,
		shift,
		ctrl,
		meta,
		key
	}
}