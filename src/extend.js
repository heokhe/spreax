export default function extend(instance, {
	state = {},
	actions = {},
	computed = {},
	formatters = {},
}) {
	const define = Object.defineProperty // just for ease of use

	for (const p in state) {
		define(instance, p, {
			get: () => instance.$proxy[p],
			set: nv => { instance.$proxy[p] = nv },
			configurable: false,
			enumerable: false
		})
	}
	for (const a in actions) instance[a] = actions[a].bind(instance)
	for (const c in computed) {
		define(instance, c, {
			get: computed[c].bind(instance),
			set: () => false,
			configurable: false
		})
	}
	for (const f in formatters) instance.$formatters[f] = formatters[f].bind(instance)
}