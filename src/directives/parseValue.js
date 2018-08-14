/**
 * @typedef {Object} ParsedValue
 * @property {string} value
 * @property {{ [x: string]: true }} modifiers
 * @param {string} string 
 * @returns {ParsedValue}
 */
export default function parseValue(string) {
	const R = /^([a-zA-Z0-9$_]+)(\+|-|['"`]|!)?((?: #[a-z]+)+)?$/
	let [, prop, shortcut, m] = R.exec(attr.value),
	modifiers = {},
		isAction = typeof shortcut === 'undefined'
		
		if (typeof m === 'string') m.trimLeft().split('#').filter(Boolean).map(e => e.trim()).forEach(mo => {
			modifiers[mo] = true
	})
};
// TBD. 