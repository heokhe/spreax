/**
 * Gets all non-empty text nodes of an element, recursively.
 * @param {Element} el 
 * @returns {Node[]}
 */
export default function getTextNodes(el) {
	let n = [];

	for (const node of el.childNodes) {
		if (!/\S+/g.test(node.textContent)) continue;
		const type = node.nodeType;
		if (type === Node.TEXT_NODE) {
			n.push(node);
		} else if (type === Node.ELEMENT_NODE) {
			n = [...n, ...getTextNodes(node)];
		}
	}
	
	return n;
}