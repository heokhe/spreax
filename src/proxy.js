/**
 * @typedef {(object: *, key: string) => void} ProxyHookFunction
 * @typedef {Object} ProxyHooks
 * @property {ProxyHookFunction} beforeSet
 * @property {ProxyHookFunction} setted
 */

/**
 * @param {*} object 
 * @param {ProxyHooks} hooks
 */
export default function makeProxy(object, hooks) {
	return new Proxy(object, {
		get(obj, key) {
			if (!obj.hasOwnProperty(key)) throw new Error(`unknown state property "${key}"`)
			return obj[key]
		},
		deleteProperty: () => false,
		set(obj, key, value) {
			if (!obj.hasOwnProperty(key)) throw new Error(`unknown state property "${key}"`)
			if (obj[key] === value) return false
			hooks.beforeSet(obj, key)
			obj[key] = value
			hooks.setted(obj, key)
			return true
		}
	})
}