import { getAllNodes } from './dom';

/**
 * Fires the given callback when a node is added to the tree.
 * @param {Element} el
 * @param {(target: Node) => void} callback
 */
export default function observe(el, callback) {
  new MutationObserver(muts => {
    for (const { addedNodes } of muts) {
      for (const anode of addedNodes) {
        getAllNodes(anode).forEach(node => callback(node));
      }
    }
  }).observe(el, {
    characterData: true,
    childList: true,
    subtree: true
  });
}
