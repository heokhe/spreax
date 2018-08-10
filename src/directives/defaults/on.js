import { register } from "../core"
import validEvent from '../../events/isValid'

function parseAttribute(attr){
	const R = /^([a-z0-9$_]+)((?: ?#[a-z0-9]+)+)?$/i
	let [, value, m] = R.exec(attr.value),
	modifiers = {}

	if (typeof m !== 'undefined') m.split('#').filter(e => !!e.trim()).map(e => e.trim()).forEach(m => {
		modifiers[m] = true
	})
	return {
		name: attr.name,
		value,
		originalValue: attr.value,
		modifiers
	}
}

register('on*', function(el, attr, wcv){
	attr = parseAttribute(attr)
	console.log(attr);
	el.addEventListener(wcv, e => {
		attr.modifiers.prevent && e.preventDefault()
		this.actions[attr.value]()
	}, {
		once: attr.modifiers.once,
		passive: attr.modifiers.passive,
		capture: attr.modifiers.capture,
	})
}, true)