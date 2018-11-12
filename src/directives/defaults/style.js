import { register } from '../register'
import { kebabToCamel } from '../../utils/case'

register('style', function ({ element, argument: cssProp, attributeValue }) {
	cssProp = kebabToCamel(cssProp)

	const noUnits = 'opacity, z-index, font-weight, line-height'.split(', ')
	
	this.$on(attributeValue || cssProp, v => {
		// `+v` means `Number(v)`
		if (!isNaN(+v) && !noUnits.includes(cssProp)) v = `${v}px`
		
		element.style[cssProp] = v
	}, {
		node: element,
		type: 'd',
		immediate: true
	})
}, { argumentIsRequired: true })