import { register } from "../core"
import error from "../../error"

register('model', function(el, attr) {
	if (!/^(?:INPUT|TEXTAREA)$/.test(el.tagName)) error('<input> or <textarea> required for "sync" directive')
	const propName = attr.value
	el.addEventListener('keydown', () => {
		setTimeout(() => {
			let isNumberInput = el.type === 'number',
			v = isNumberInput ? Number(el.value) : el.value
			if (v !== this.state[propName]) this.state[propName] = v
		}, 0)
	})
	this.$_onChange(propName, v => {
		el.value = v
	}, true)
})