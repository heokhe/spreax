import directivesOf from './dom/directivesOf'
import ErrorInElement from './domError'
import { all as REGISTRY } from './directives/index'

/**
 * @param {Element} el
 * @param {(callback: import("./directives").Callback, args: import("./directives").DirectiveCallbackArg) => void} callbackFn
 */
export default function execDirectives (el, callbackFn) {
	if (!el.attributes.length) return

	const dirsOfEl = directivesOf(el)
	for (const di of dirsOfEl) {
		if (!REGISTRY.hasOwnProperty(di.name)) throw new ErrorInElement(`directive "${di.name}" not found`, el)

		const { options, callback } = REGISTRY[di.name]

		if (options.argumentIsRequired && !di.arg) throw new ErrorInElement(`directive needs an arguments, but there's nothing`, el)

		callbackFn(callback, {
			element: el,
			attributeValue: el.getAttribute(`${di}`),
			modifiers: di.modifiers,
			argument: di.arg
		})
	}
}