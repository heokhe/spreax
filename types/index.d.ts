import { Bindings } from "../src/directives/core"

type action = (this: Hdash, arg?: any) => void
type watcher = (this: Hdash, v?: any) => void
type obj<T = any> = Record<string, T>

declare module 'hdash'

export = class Hdash {
	constructor(el: Element | string, options: {
		state?: obj
		actions?: obj<action>
		watchers?: obj<watcher>
	})
	state: obj
	readonly actions: obj<action>
	readonly watchers: obj<watcher>
	private $_emit(name: string): void
	private $_onChange(name: string, fn: (v: any) => void, immediate?: boolean): void
}	
export function directive(name: string, fn: (this: Hdash, el: Element, bindings: Bindings) => void, arg: 0 | 1 | 2 = 1): void
export as namespace Hdash