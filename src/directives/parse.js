import record from '../utils/record'

/**
 * @param {string} attr 
 */
export default function parse(attr) {
	let reg = /((?: --[a-z]+)+)$/,
	value = attr.replace(reg, ''),
	modString = reg.exec(attr),
	modObject = {}

	modString = modString === null ? null : modString[0]

	if (modString !== null) {
		let modKeys = modString.split(' --').filter(e => !!e)
		modObject = record(modKeys, true)
	}

	return {
		value,
		modifiers: modObject
	}
}