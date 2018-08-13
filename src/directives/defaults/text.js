import { register } from "../core"
import sanitizeHTML from '../../utils/sanitizeHTML'

register('text', function(el, attr) {
	const setText = (el) => {
		return t => {
			if (typeof t === 'string') t = sanitizeHTML(t).replace(/  /g, '&nbsp;&nbsp;').replace(/\n/g, '<br>')
			el.innerHTML = t
		}
	}

	const val = attr.value
	if (!!val) {
		this.$_onChange(val, setText(el), true)
	} else {
		/* const pattern = /\{\{([a-z0-9_$]+)\}\}/gi,
		toFormatElement = el => pattern.test(el.innerHTML)
		let children = Array.from(el.querySelectorAll('*')).filter(toFormatElement)
		children.forEach(ch => {
			ch.innerHTML.replace(pattern, ($$, $1) => {
				this.$_onChange($1, t => {
					setText(ch	, t)
				}, true)
			})
		}) */
	}
})