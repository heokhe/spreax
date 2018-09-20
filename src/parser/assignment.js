import PRIMITIVES from './_primitives';

/**
 * Parses an assignment statement.
 * @param {string} string
 * @returns {{prop: string, getValue: (o?: any) => any}}
 * @throws {SyntaxError}
 */
export default function(string) {
	const match = string.match(/^(.+) = (.+)$/);
	if (match === null) throw new SyntaxError(`string "${string}" is not a valid assignment statement`);

	let [, prop, value] = match,
	usesProperty = false;

	if (value in PRIMITIVES) value = PRIMITIVES[value];
	else if (!isNaN(Number(value))) value = Number(value);
	else if (/^(['"`]).*\1$/.test(value)) value = value.slice(1, -1);
	else if (/^\w+$/i.test(value)) usesProperty = true;
	else throw new SyntaxError(`could not find any values matching "${value}"`);

	return {
		prop,
		getValue: o => usesProperty ? o[value] : value
	};
}