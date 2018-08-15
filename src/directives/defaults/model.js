import { register } from "../core"
import error from "../../error"

register('model', function(el, binding) {
	if (!/^(?:INPUT|TEXTAREA)$/.test(el.tagName)) error('<input> or <textarea> required for "model" directive')
	const prop = binding.value

	let eventName = binding.modifiers.lazy ? 'change' : 'keydown'

	el.addEventListener(eventName, () => {
		setTimeout(() => {
			let isNumberInput = el.type === 'number',
			v = isNumberInput ? Number(el.value) : el.value
			if (v !== this.state[prop]) this.state[prop] = v
		}, 0)
	})
	this.$_onChange(prop, v => {
		el.value = v
	}, true)
})