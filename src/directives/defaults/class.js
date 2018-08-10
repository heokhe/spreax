import { register } from "../core"

register('class-*', function(el, attr, className){
	let prop = attr.value || className
	this.$_onChange(prop, b => {
		el.classList[!b ? 'remove' : 'add'](className)
	}, true)
}, true)