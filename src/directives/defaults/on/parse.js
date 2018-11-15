const PRIMITIVES = {
	'null': null,
	'!0': !0,
	'!1': !1,
	'false': false,
	'true': true,
	undefined
}

/**
 * @param {string} string
 * @returns {{prop: string, getValue: (o?: any) => any}}
 */
export default function (string) {
	const match = string.match(/^(.+) = (.+)$/)
	if (match === null) throw new SyntaxError(`string "${string}" is not a valid assignment statement`)

	// eslint-disable-next-line prefer-const
	let [, prop, value] = match, usesProperty = false

	if (value in PRIMITIVES) value = PRIMITIVES[value]
	else if (!isNaN(+value)) value = Number(value)
	else if (/^(['"`]).*\1$/.test(value)) value = value.slice(1, -1)
	else if (/^!?\w+$/i.test(value)) usesProperty = true
	else throw new SyntaxError(`could not find any values matching "${value}"`)

	return {
		prop,
		getValue: o => {
			if (!usesProperty) return value
			return value.startsWith('!') ? !o[value.slice(1)] : o[value]
		}
	}
}