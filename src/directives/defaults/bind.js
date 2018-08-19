import { register } from '../core'
import error from '../../error'

register('bind-*', function(el, {value, wildcard: attr}){
	this.$_onChange(value, v => {
		el.setAttribute(attr, v)
	}, true)
})