import { register } from "../core"
import error from "../../error"

register('model', function(el, binding) {
	if (!/^(?:INPUT|TEXTAREA)$/.test(el.tagName)) error('<input> or <textarea> required for "model" directive')
	const prop = binding.value

	let eventName = binding.modifiers.lazy ? 'change' : 'keydown'

	el.addEventListener(eventName, () => {
		setTimeout(() => {
			let v = el.value,
			isNumberInput = el.type === 'number';

			if (isNumberInput) v = Number(v)
			if (binding.modifiers.trim && !isNumberInput) v = v.trim()
			
			if (v !== this.state[prop]) this.state[prop] = v
		}, 0)
	})
	this.$_onChange(prop, v => {
		el.value = v
	}, true)
})