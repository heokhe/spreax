import { register } from "../core"
import error from "../../error"

register('model', function(el, {value, modifiers}) {
	if (!/^(?:INPUT|TEXTAREA)$/.test(el.tagName)) error('<input> or <textarea> required for "model" directive')
	let eventName = modifiers.lazy ? 'change' : 'keydown'

	el.addEventListener(eventName, () => {
		setTimeout(() => {
			let v = el.value,
			isNumberInput = el.type === 'number';

			if (isNumberInput) v = Number(v)
			if (modifiers.trim && !isNumberInput) v = v.trim()
			
			if (v !== this.state[value]) this.state[value] = v
		}, 0)
	})
	this.$_onChange(value, v => {
		el.value = v
	}, true)
})