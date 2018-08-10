/**
 * @param {string} msg 
 * @param {boolean} [isWarn]
 */
export default function error(msg, isWarn) {
	const fmsg = `[ryo${!isWarn ? ' error' : ''}] ${msg}`
	if (isWarn) console.warn(fmsg)
	else throw new Error(fmsg)
}