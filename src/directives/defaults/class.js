import { register } from "../core"

register('class', function(el, {value, arg}){
	this.$_onChange(value || arg, b => {
		el.classList[!b ? 'remove' : 'add'](arg)
	}, true)
})