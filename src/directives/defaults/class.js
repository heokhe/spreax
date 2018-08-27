import { register } from "../register"

const fn = function (el, value, mod, arg) {
	const list = el.classList,
	bool = !!this.state[value || arg];

	list[bool ? 'add' : 'remove'](arg || value)
}

register('class', {
	ready: fn,
	updated: fn
}, 'required')