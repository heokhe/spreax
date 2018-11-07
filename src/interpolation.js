/**
 * @typedef {Object} IntpCallbackArg
 * @property {string} initialText
 * @property {string} propertyName
 * @property {string[]} formatters
 * @property {Node} node
 * @property {{startIndex: number, string: string}} match
 * @private
 */

/**
 * Finds curly-braces in a node, extracts info, fires the callback.
 * @param {Node} node 
 * @param {(x: IntpCallbackArg) => void} callback
 */

export default function (node, callback) {
	const RE = /{{( ?)\w+(?: \| \w+)*\1}}/gi,
		text = node.textContent;

	if (!RE.test(text)) return;

	/** @type {{string: string, startIndex: number}[]} */
	let matches = [];

	text.replace(RE, (match, index) => {
		matches.push({
			string: match,
			startIndex: index
		});
		return match;
	});

	for (const { string, startIndex } of matches) {
		let [prop, ...formatters] = string.replace(/^{{/, '')
			.replace(/}}$/, '').trim().split(' | ');

		callback({
			initialText: text,
			node,
			formatters,
			match: { startIndex, string },
			propertyName: prop
		});
	}
}