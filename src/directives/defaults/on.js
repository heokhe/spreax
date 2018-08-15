import { register } from "../core"

register('on*', function(el, binding) {
	el.addEventListener(binding.wildcard, e => {
		binding.modifiers.prevent && e.preventDefault()

		const SHORTCUT_REGEXP = /(?:--|\+\+|[`"']|!)$/

		let prop = binding.value,
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
		once: binding.modifiers.once,
		passive: binding.modifiers.passive,
		capture: binding.modifiers.capture,
	})
})