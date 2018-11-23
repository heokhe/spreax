import getTextNodes from './dom/getTextNodes'

/**
 * @typedef {(node: Node) => void} MutationHooksCallback
 * @typedef {object} MutationHooks
 * @property {MutationHooksCallback} elementAdded
 * @property {MutationHooksCallback} textAdded
 * @property {MutationHooksCallback} elementRemoved
 * @property {MutationHooksCallback} textRemoved
 */

/**
 * Creates a mutation observer.
 * @param {MutationHooks} hooks 
 * @returns {MutationObserver}
 */

export default function createObserver(hooks) {
	const { TEXT_NODE, ELEMENT_NODE } = Node

	return new MutationObserver(muts => {
		for (const mut of muts) {
			for (const anode of mut.addedNodes) {
				if (anode.nodeType === TEXT_NODE) {
					// when changing a node's text with any method like 
					// `node.innerHTML = "#[someProp]"` it should not have value of `someProp`
					if (mut.type === 'childList' && mut.target.hasChildNodes(anode)) continue
					hooks.textAdded(anode)
				} else if (anode.nodeType === ELEMENT_NODE) {
					getTextNodes(anode).forEach(n => hooks.textAdded(n))
					hooks.elementAdded(anode)
				}
			}

			for (const rnode of mut.removedNodes) {
				if (rnode.nodeType === TEXT_NODE) hooks.textRemoved(rnode)
				else if (rnode.nodeType === ELEMENT_NODE) {
					getTextNodes(rnode).forEach(n => hooks.textRemoved(n))
					hooks.elementRemoved(rnode)
				}
			}
		}
	})
}