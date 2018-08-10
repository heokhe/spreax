type action = (e?: Event) => void 

declare module 'ryo' {
	class Ryo {
		constructor(el: Element | string, options: {
			state?: object;
			actions?: {
				[x: string]: action
			};
		});
		state: ProxyConstructor<object>;
		actions: {
			[x: string]: action
		};
		private $_emit(name: string): void;
		private $_onChange(name: string, fn: (value: any) => void, immediate?: boolean);
	}

	export = Ryo
}