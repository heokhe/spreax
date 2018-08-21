import { Bindings } from "../src/directives/core"

type HdashAction = (this: Hdash, arg?: any) => void
type HdashWatcher = (this: Hdash, v?: any) => void
type obj<T = any> = {
	[x: string]: T
}

declare module 'hdash'

export = class Hdash {
	constructor(el: Element | string, options: {
		state?: obj
		actions?: obj<HdashAction>
		watchers?: obj<HdashWatcher>
	})
	state: obj
	readonly actions: obj<action>
	readonly watchers: obj<HdashWatcher>
	private $_emit(name: string): void
	private $_onChange(name: string, fn: (v: any) => void, immediate?: boolean): void
}
export function directive(name: string, fn: (this: Hdash, el: Element, bindings: Bindings) => void, arg: 0 | 1 | 2 = 1): void
export as namespace Hdash