/**
 * @param {Element} el 
 * @returns {Node[]}
 */
export default function getTextNodes(el) {
	let n = []

	for (const node of el.childNodes) {
		const type = node.nodeType;
		if (type === document.TEXT_NODE) {
			n.push(node)
		} else if (type === document.ELEMENT_NODE) {
			n = [...n, ...getTextNodes(node)]
		}
	}
	return n.filter(e => {
		return /\S+/g.test(e.textContent)
	})
}