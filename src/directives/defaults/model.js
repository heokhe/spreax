import { register } from '../register'

register('model', {
	ready(el, value, { lazy }) {
		el.value = this.state[value]
		el.addEventListener('change', () => {
			let v = el.value;
			if (el.type === 'checkbox') v = el.checked
			this.state[value] = v
		})
		if (el.type === 'text' && !lazy) {
			el.addEventListener('keydown', () => {
				setTimeout(() => {
					this.state[value] = el.value
				}, 0)
			})
		}
	},
	updated(el, value) {
		let prop = 'value';
		if (el.type === 'checkbox') prop = 'checked'
		if (el[prop] !== this.state[value]) el[prop] = this.state[value]
	}
}, 'empty')