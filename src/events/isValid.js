/**
 * Checks if given event name is a valid one.
 * @param {string} ev
 * @returns {boolean}
 */
export default ev => Object.keys(window).filter(e => /^on/.test(e)).map(e => e.replace(/^on/, '')).includes(ev)