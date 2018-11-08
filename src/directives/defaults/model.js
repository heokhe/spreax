import { register } from '../register';
import ErrorInElement from '../../domError';

register('model', {
	ready({ element: el, attributeValue: propName, modifiers: { lazy } }) {
		if (!['select', 'input', 'textarea'].includes(el.tagName.toLowerCase())) {
			throw new ErrorInElement(`model directive only works on input, textarea or select tags`, el);
		}

		if (el.type === 'checkbox') {
			el.checked = !!this[propName];
		} else {
			el.value = this[propName];
		}

		el.addEventListener('change', () => {
			this[propName] = el.type === 'checkbox' ? el.checked : el.value;
		});

		if (el.type === 'text' && !lazy) {
			el.addEventListener('keydown', () => {
				setTimeout(() => {
					this[propName] = el.value;
				}, 0);
			});
		}
	},
	updated({ element: el, attributeValue: value }) {
		let propName = el.type === 'checkbox' ? 'checked' : 'value';

		el[propName] = this[value];
	}
});