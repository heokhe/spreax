import record from "../utils/record";
import { domError } from "../error";

/**
 * @param {Element} el 
 */
export default function(el) {
	return Array.from(el.attributes)
		.map(e => e.name)
		.filter(e => /^sp-/.test(e))
		.map(e => e.replace(/^sp-/, ''))
		.map(e => {
			let [, name, arg, modifiers] = e.match(/^([a-z]+(?:-[a-z]+)*)(:[a-z0-9]+)?((?:\.[a-z0-9]+))*$/);
			if (arg) arg = arg.replace(/^:/, '');
			if (modifiers) {
				modifiers = record(modifiers.split('.').filter(Boolean), true);
			} else modifiers = {};
			return { name, arg, modifiers };
		}).filter((e, index, arr) => {
			const getFullName = e => e.arg ? [e.name, e.arg].join(':') : e.name,
			fullName = getFullName(e),
			withThisFullName = arr.filter(e => getFullName(e) === fullName);

			if (withThisFullName.length > 1) {
				domError(`duplicate directive ${e.name}`, el, true);
				return withThisFullName[0];
			} else return e;
		});
}