/**
 * @typedef {Object} IntpCallbackArg
 * @property {string} initialText
 * @property {string} propertyName
 * @property {string[]} formatters
 * @property {Node} node
 * @property {{startIndex: number, string: string}} match
 */

/**
 * Finds curly-braces in `node`, extracts info, executes `callback`.
 * @param {Node} node 
 * @param {(arg: IntpCallbackArg) => void} callback
 */

export default function (node, callback) {
	const RE = /#\[( ?)\w+(?: \w+)*\1\]/gi,
	text = node.textContent;

	if (!RE.test(text)) return;

	/** @type {{string: string, startIndex: number}[]} */
	const matches = [];

	text.replace(RE, (string, _, index) => {
		matches.push({
			string, startIndex: index
		});
		return string;
	});

	for (const { string, startIndex } of matches) {
		let [prop, ...formatters] = string.replace(/^#\[ ?/, '')
			.replace(/ ?\]$/, '').split(' ');

		callback({
			initialText: text,
			node,
			formatters,
			match: { startIndex, string },
			propertyName: prop
		});
	}
}