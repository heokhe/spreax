import record from '../utils/record'
import camel from '../utils/camel'

/**
 * @param {string} attr 
 */
export default function parse(attr) {
	let reg = /((?: --(?:(?:[a-z]+-)*[a-z0-9]+)+)+)$/,
	value = attr.replace(reg, ''),
	modString = reg.exec(attr),
	modObject = {}

	modString = modString === null ? null : modString[0]

	if (modString !== null) {
		let modKeys = modString.split(' --').filter(e => !!e).map(camel)
		modObject = record(modKeys, true)
	}

	return {
		value,
		modifiers: modObject
	}
}