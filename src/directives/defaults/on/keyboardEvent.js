/**
 * @typedef {Object} KBevent
 * @property {number} key
 * @property {boolear} alt
 * @property {boolear} shift
 * @property {boolear} ctrl
 * @property {boolear} meta
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