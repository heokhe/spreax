import { register } from '../register';
import { domError } from '../../error';

register('model', {
	ready(el, value, { lazy }) {
		if (!['select', 'input', 'textarea'].includes(el.tagName.toLowerCase())) domError(`model directive only works on input, textarea or select tags`, el);

		if (el.type === 'checkbox') {
			el.checked = !!this[value];
		} else {
			el.value = this[value];
		}
		el.addEventListener('change', () => {
			let v = el.value;
			if (el.type === 'checkbox') v = el.checked;
			this[value] = v;
		});
		if (el.type === 'text' && !lazy) {
			el.addEventListener('keydown', () => {
				setTimeout(() => {
					this[value] = el.value;
				}, 0);
			});
		}
	},
	updated(el, value) {
		let prop = 'value';
		if (el.type === 'checkbox') prop = 'checked';
		if (el[prop] !== this[value]) el[prop] = this[value];
	}
}, 'empty');