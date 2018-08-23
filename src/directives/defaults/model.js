import { register } from "../core"
import { domError } from "../../error"

register('model', function(el, {value, modifiers}) {
	if (!/^(?:INPUT|TEXTAREA)$/.test(el.tagName)) domError('<input> or <textarea> required for "model" directive', el)
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
}, 0)