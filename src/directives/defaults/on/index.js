import { register } from '../../register';
import parse from './parse';
import isValidEvent from './isValidEvent';

register('on', function ({ element: el, attributeValue: value, modifiers, argument: eventName }) {
	if (!isValidEvent(eventName)) throw new TypeError(`event "${eventName}" is not a valid DOM event.`);
	let hasShortcut = / = .+$/.test(value);

	el.addEventListener(eventName, event => {
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
}, { argumentIsRequired: true });