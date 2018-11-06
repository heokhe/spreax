/**
 * @typedef {(node: Node) => void} MutationEventCallback
 * @typedef {Object} MutationEventsObject
 * @property {MutationEventCallback} [elementAdded]
 * @property {MutationEventCallback} [textAdded]
 * @property {MutationEventCallback} [elementRemoved]
 * @property {MutationEventCallback} [textRemoved]
 * @private
 */

/**
 * Creates an mutation observer, returns it.
 * @param {MutationEventsObject} events 
 * @returns {MutationObserver}
 */

export default function makeObserver(events) {
	const { TEXT_NODE, ELEMENT_NODE } = Node;

	return new MutationObserver(muts => {
		for (const mut of muts) {
			for (const anode of mut.addedNodes) {
				if (anode.nodeType === TEXT_NODE) {
					// when changing a node's text with any method like 
					// `node.innerHTML = "{{ someProp }}"` it should not have value of `someProp`
					if (mut.type === 'childList' && mut.target.hasChildNodes(anode)) continue;
					events.textAdded(anode);
				} else if (anode.nodeType === ELEMENT_NODE) events.elementAdded(anode);
			}

			for (const rnode of mut.removedNodes) {
				if (rnode.nodeType === TEXT_NODE) events.textRemoved(rnode);
				else if (rnode.nodeType === ELEMENT_NODE) events.elementRemoved(rnode);
			}
		}
	});
}