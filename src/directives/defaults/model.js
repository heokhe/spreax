import { register } from '../register'

register('model', {
	ready(el, value, { lazy }) {
		el.value = this[value]
		el.addEventListener('change', () => {
			let v = el.value;
			if (el.type === 'checkbox') v = el.checked
			this[value] = v
		})
		if (el.type === 'text' && !lazy) {
			el.addEventListener('keydown', () => {
				setTimeout(() => {
					this[value] = el.value
				}, 0)
			})
		}
	},
	updated(el, value) {
		let prop = 'value';
		if (el.type === 'checkbox') prop = 'checked'
		if (el[prop] !== this[value]) el[prop] = this[value]
	}
}, 'empty')