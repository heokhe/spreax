import record from '../utils/record'
import camel from '../utils/camel'

/**
 * @param {string} str 
 * @returns {{[x: string]: true}}
 */
export default function getModifiers(str) {
	const [modString] = str.match(/(?: --[a-z]+(?:-[a-z0-9]+)*)*$/)

	if (modString === '') return {}

	let modKeys = []
	modString.trim().split(' ').map(e => e.replace(/^--/, '')).map(camel).forEach(e => {
		modKeys.push(e)
	})

	return record(modKeys, true)
}