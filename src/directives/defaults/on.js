import { register } from '../register';

register('on', function(el, value, modifiers, arg) {
	let sh_reg = / = (.*)$/,
	[, shortcut] = value.match(sh_reg) || [],
	hasShortcut = !!shortcut,
	pureValue = value.replace(sh_reg, '');
	el.addEventListener(arg, event => {
		if (modifiers.prevent) event.preventDefault();
		if (hasShortcut) {
			let v;
			if (/^(['"`]).*\1$/.test(shortcut)) v = shortcut.slice(1, -1);
			else if (shortcut === 'null') v = null;
			else if (shortcut === 'true') v = true;
			else if (shortcut === 'false') v = false;
			else if (shortcut === '!0') v = true;
			else if (shortcut === '!1') v = false;
			else if (!isNaN(Number(shortcut))) v = Number(shortcut);
			else v = this[shortcut];

			this[pureValue] = v;
		} else {
			this[value]();
		}
	}, {
		once: modifiers.once,
		passive: modifiers.passive,
		capture: modifiers.capture,
	});
}, 'required');