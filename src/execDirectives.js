import directivesOf from './dom/directivesOf'
import SpreaxDOMError from './error'
import { REGISTRY } from './directives/'

/**
 * @param {Element} el
 * @param {(callback: import("./directives").Callback, args: import("./directives").DirectiveCallbackArg) => void} callbackFn
 */
export default function execDirectives (el, callbackFn) {
	if (!el.attributes.length) return

	const dirsOfEl = directivesOf(el)
	for (const di of dirsOfEl) {
		if (!REGISTRY.hasOwnProperty(di.name)) throw new SpreaxDOMError(`directive "${di.name}" not found`, el)

		const { argRequired, callback } = REGISTRY[di.name]

		if (argRequired && !di.arg) throw new SpreaxDOMError(`directive needs an arguments, but there's nothing`, el)

		callbackFn(callback, {
			element: el,
			attributeValue: el.getAttribute(`${di}`),
			modifiers: di.modifiers,
			argument: di.arg
		})
	}
}