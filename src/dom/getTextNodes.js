/**
 * Gets all non-empty text nodes of an element, recursively.
 * @param {Element} el 
 * @returns {Node[]}
 */
export default function getTextNodes(el) {
	let n = []
	const { TEXT_NODE, ELEMENT_NODE } = Node

	for (const node of el.childNodes) {
		if (!/\S+/g.test(node.textContent)) continue

		const { nodeType: type } = node
		if (type === TEXT_NODE) n.push(node)
		else if (type === ELEMENT_NODE) n = n.concat(getTextNodes(node))
		else continue
	}
	
	return n
}