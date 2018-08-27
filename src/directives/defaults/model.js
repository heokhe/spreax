import { register } from '../register'

register('model', {
	ready(el, value) {
		el.value = this.state[value]
		el.addEventListener('keydown', () => {
			setTimeout(() => {
				this.state[value] = el.value
			}, 0)
		})
	},
	updated(el, value) {
		if (el.value !== this.state[value]) el.value = this.state[value]
	}
}, 'empty')