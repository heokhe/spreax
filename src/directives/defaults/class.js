import { register } from '../register'

register('class', function ({ element: el, argument: className, attributeValue: propName }) {
	this.$onUpdate(v => {
		el.classList[v ? 'add' : 'remove'](className || propName)
		
		const attr = el.getAttribute('class')
		if (attr !== null && !attr.length) el.removeAttribute('class')
	}, {
		immediate: true,
		ownerNode: el,
		prop: propName || className
	})
}, true)