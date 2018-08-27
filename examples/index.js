var instance = new Hdash('#app', {
	state: {
		title: 'Hello!',
		model_name: 'type your name',
		sh: '',
		cls: true
	},
	formatters: {
		upper: s => s.toUpperCase()
	}
})