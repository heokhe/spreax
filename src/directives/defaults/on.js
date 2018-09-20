import { register } from '../register';
import parse from '../../parser/assignment';

register('on', function(el, value, modifiers, arg) {
	let hasShortcut = / = .+$/.test(value);
	
	el.addEventListener(arg, event => {
		if (modifiers.prevent) event.preventDefault();
		
		if (hasShortcut) {
			let pa = parse(value);
			this[pa.prop] = pa.getValue(this);
		} else {
			this[value]();
		}
	}, {
		once: modifiers.once,
		passive: modifiers.passive,
		capture: modifiers.capture,
	});
}, 'required');