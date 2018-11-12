/**
 * @param {Element} el 
 * @param {(string|Element)} root 
 * @returns {string}
 */
export default function(el, root = 'body') {
	if (typeof root === 'string') root = document.querySelector(root)

	let pathSections = []
	while (el !== root) {
		pathSections.unshift(el)
		el = el.parentElement
	}
	pathSections.unshift(root)

	pathSections = pathSections.map(ps => {
		let selector = ps.tagName.toLowerCase()
		if (ps.className) selector += `.${  ps.className.trim().split(' ').join('.')}`
		if (ps.id) selector += `#${  ps.id}`
		selector = selector.replace(/^div([^$]+)/, '$1')
		return selector
	})

	return pathSections.join(' > ')
}