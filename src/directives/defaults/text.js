import { register } from "../core"
import sanitizeHTML from '../../utils/sanitizeHTML'
import arrayUnique from '../../utils/arrayUnique'

register('text', function(el, {value}) {
	if (!!value) {
		this.$_onChange(value, text => {
			text = String(text)
			text = sanitizeHTML(text).replace(/  /g, '&nbsp;&nbsp;').replace(/\n/g, '<br>')
			el.innerHTML = text
		}, true)
	} else {
		const REG = /\{\{\w+\}\}/gi,
		removeBraces = p => p.replace(/^\{\{/, '').replace(/\}\}$/, '')
		
		let els = Array.from(el.children)
		els.unshift(el)

		els.forEach(el => {
			Array.from(el.childNodes)
				.filter(n => n.nodeType === 3)
				.filter(n => !!n.textContent.trim())
				.filter(n => REG.test(n.textContent))
				.forEach(node => {
					const text = node.textContent,
					usedProps = arrayUnique(text.match(REG).map(removeBraces))
	
					usedProps.forEach(prop => {
						this.$_onChange(prop, v => {
							node.textContent = text.replace(new RegExp('\\{\\{' + prop + '\\}\\}', 'g'), v)
						}, true)
					})
				})
		})
	}
})