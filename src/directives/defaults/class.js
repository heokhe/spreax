import { register } from "../core"

register('class-*', function(el, {value, wildcard}){
	this.$_onChange(value || wildcard, b => {
		el.classList[!b ? 'remove' : 'add'](wildcard)
	}, true)
})