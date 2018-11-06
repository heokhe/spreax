import { register } from '../register';
import ErrorInElement from '../../domError';

register('model', {
	ready(el, value, { lazy }) {
		if (!['select', 'input', 'textarea'].includes(el.tagName.toLowerCase())) {
			throw new ErrorInElement(`model directive only works on input, textarea or select tags`, el);
		}

		if (el.type === 'checkbox') {
			el.checked = !!this[value];
		} else {
			el.value = this[value];
		}

		el.addEventListener('change', () => {
			this[value] = el.type === 'checkbox' ? el.checked : el.value;
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
		let prop = el.type === 'checkbox' ? 'checked' : 'value';

		el[prop] = this[value];
	}
}, 'empty');