type action = (this: Ryo, event?: Event) => void
type watcher = (this: Ryo, v?: any) => void
type obj<T = any> = Record<string, T>

class Ryo {
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

declare module 'ryo' {
	export = Ryo
}
export as namespace Ryo