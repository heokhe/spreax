import { register } from "../core"

register('on*', function(el, bindings) {
	el.addEventListener(bindings.wildcard, e => {
		bindings.modifiers.prevent && e.preventDefault()

		const SHORTCUT_REGEXP = /(?:--|\+\+|[`"']|!)$/

		let prop = bindings.value,
		shortcut = prop.match(SHORTCUT_REGEXP),
		isAction = shortcut === null

		shortcut = shortcut === null ? null : shortcut[0]
		
		if (isAction) {
			this.actions[prop]()
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
			}
		}
	}, {
		once: bindings.modifiers.once,
		passive: bindings.modifiers.passive,
		capture: bindings.modifiers.capture,
	})
})