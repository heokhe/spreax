import record from "../utils/record";
import toString from "../directives/toString";

/**
 * @param {Element} el 
 * @returns {{name: string, ?arg: string, modifiers: Object<string, true>}[]}
 */
export default function(el) {
	const { attributes } = el,
	directives = [];
	for (let { name: attrName } of attributes) {
		if (!/^sp-/.test(attrName)) continue;
		attrName = attrName.replace(/^sp-/, '');

		let [, name, arg, modifiers] = attrName.match(/^([a-z]+(?:-[a-z]+)*)(:[a-z0-9]+)?((?:\.[a-z0-9]+))*$/);
		if (arg) arg = arg.replace(/^:/, '');
		const modifierObject = modifiers ? record(modifiers.slice(1).split('.'), true) : {};

		const d = {
			name,
			arg: arg || null, 
			modifiers: modifierObject
		};

		directives.push({ 
			...d,
			// no need to use `toString` function, we just use `${object}` and we have a string form of directive object
			[Symbol.toPrimitive]: hint => hint === 'number' ? NaN : toString(d)
		});
	}

	return directives.filter((d, _, arr) => {
		const getFullName = e => e.arg ? [e.name, e.arg].join(':') : e.name,
		withThisName = arr.filter(e => getFullName(e) === getFullName(d));

		return withThisName.length > 1 ? withThisName[0] : d;
	});
}