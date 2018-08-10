type action<R = Ryo> = (this: R, event?: Event) => void
type o<T = any> = Record<string, T>

class Ryo {
	constructor(el: Element | string, options: {
		state?: o;
		actions?: o<action>;
	});
	state: ProxyConstructor<o>;
	readonly actions: o<action>;
	private $_emit(name: string): void;
	private $_onChange(name: string, fn: (v: any) => void, immediate?: boolean): void;
}

declare module 'ryo' {
	export = Ryo
	export as namespace Ryo
}