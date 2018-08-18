import { Bindings } from "../src/directives/core"

type action = (this: Ryo, arg?: any) => void
type watcher = (this: Ryo, v?: any) => void
type obj<T = any> = Record<string, T>

declare module 'ryo'

export = class Ryo {
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
export function directive(name: string, fn: (this: Ryo, el: Element, bindings: Bindings) => void): void
export as namespace Ryo