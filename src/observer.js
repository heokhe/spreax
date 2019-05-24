import { getAllNodes } from './dom';

/**
 * @param {Element} el
 * @param {(target: Node, isRemoved: true) => void} callback
 */
export default function observe(el, callback) {
  new MutationObserver(muts => {
    for (const { addedNodes, removedNodes } of muts) {
      for (const anode of addedNodes) {
        getAllNodes(anode).forEach(node => callback(node, false));
      }
      for (const rnode of removedNodes) {
        getAllNodes(rnode).forEach(node => callback(node, true));
      }
    }
  }).observe(el, {
    characterData: true,
    childList: true,
    subtree: true
  });
}
