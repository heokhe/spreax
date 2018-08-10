import { register } from "../core"

register('on*', function(el, attr, wcv) {
	const R = /^([a-zA-Z0-9$_]+)(\+\+|--|['"`]|!)?(?:  \| ((?: [a-z]+)+))?$/
	let [, prop, shortcut, m] = R.exec(attr.value),
		modifiers = {},
		isAction = typeof shortcut === 'undefined'

	if (typeof m === 'string') m.trimLeft().split(' ').forEach(mo => {
		modifiers[m] = true
	})

	el.addEventListener(wcv, e => {
		modifiers.prevent && e.preventDefault()
		if (isAction) {
			this.actions[prop]()
		} else {
			if (/'|"|`/.test(shortcut)) return this.state[prop] = ''
			switch (shortcut) {
				case '--':
					this.state[prop]--
					break
				case '++':
					this.state[prop]++
					break
				case '!':
					this.state[prop] = !this.state[prop]
					break
			}
		}
	}, {
		once: modifiers.once,
		passive: modifiers.passive,
		capture: modifiers.capture,
	})
})