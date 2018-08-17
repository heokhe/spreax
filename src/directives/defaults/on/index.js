import { register } from "../../core"
import isValidEvent from '../../../events/isValid'
import error from "../../../error"
import keyboardEvent from "./keyboardEvent"

register('on*', function(el, binding) {
	const eventName = binding.wildcard
	if (!isValidEvent(eventName)) error(`event "${binding.value}" is not a valid DOM event`)

	const isKeyboardEvent = /^key(?:down|up|press)$/.test(eventName)
	el.addEventListener(eventName, e => {
		binding.modifiers.prevent && e.preventDefault()

		const SHORTCUT_REGEXP = /(?:--|\+\+|[`"']|!|:nil)$/
		let prop = binding.value,
		shortcut = prop.match(SHORTCUT_REGEXP),
		isAction = shortcut === null;
		shortcut = shortcut === null ? null : shortcut[0]
		
		if (isKeyboardEvent) {
			let kb = keyboardEvent(e);
			const RESERVED_KEYS = {
				backspace: 8,
				tab: 9,
				enter: 13,
				shift: 16,
				ctrl: 17,
				alt: 18,
				capslock: 20,
				esc: 27,
				pageup: 33,
				pagedown: 34,
				end: 35,
				home: 36,
				left: 37,
				up: 38,
				right: 39,
				down: 40,
				insert: 45,
				delete: 46	
			}
			
			let key = Object.keys(binding.modifiers).filter(e => /^key/.test(e)).map(e => e.replace(/^key/, '').toLowerCase())
			if (!!key.length) key = kb.key
			else key = key[0]
			if (key.length > 1) error('more than one keys are declared for on event.', true)

			if (/^[a-z]$/.test(key)) key = key.charCodeAt(0) - 32
			if (key in RESERVED_KEYS) key = RESERVED_KEYS[key]

			if (
				key != kb.key ||
				'shift' in binding.modifiers !== kb.shift ||
				'alt' in binding.modifiers !== kb.alt ||
				'meta' in binding.modifiers !== kb.meta ||
				'ctrl' in binding.modifiers !== kb.ctrl
			) return 
		}

		if (isAction) {
			this.actions[prop](e)
		} else {
			prop = prop.replace(SHORTCUT_REGEXP, '')
			if (/'|"|`/.test(shortcut)) return this.state[prop] = ''
			switch (shortcut) {
				case '-':
					this.state[prop]--
					break
				case '+':
					this.state[prop]++
					break
				case '!':
					this.state[prop] = !this.state[prop]
					break
				case ':nil':
					this.state[prop] = null
					break
			}
		}
	}, {
		once: binding.modifiers.once,
		passive: binding.modifiers.passive,
		capture: binding.modifiers.capture,
	})
})