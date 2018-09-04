import { register } from "../register"

register('class', function (el, value, mod, arg) {
	const prop = value || arg;

	this.$on(prop, v => {
		el.classList[!!v ? 'add' : 'remove'](arg || value)
	}, {
		immediate: true,
		id: el,
		type: 'DIRECTIVE'
	})
}, 'required')