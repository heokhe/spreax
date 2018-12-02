/**
 * @param {Element} el 
 * @param {(string|Element)} root 
 * @returns {string}
 */
export default function(el, root = 'body') {
	if (typeof root === 'string') root = document.querySelector(root)

	const sections = []
	while (el !== root) {
		sections.unshift(el)
		el = el.parentElement
	}
	sections.unshift(root)

	return sections.map(ps => {
		let selector = ps.tagName.toLowerCase()
		if (ps.className) selector += '.' + ps.className.trim().split(' ').join('.')
		if (ps.id) selector += '#' + ps.id
		selector = selector.replace(/^div([^$]+)/, '$1')
		return selector
	}).join(' > ')
}