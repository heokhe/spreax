var instance = new Spreax('#app', {
	state: {
		name: 'Hosein',
		checkbox: false,
		classIsActive: true,
		color: 'red',
		number: 10
	},
	computed: {
		sentence() {
			return `My name is ${this.name}`
		}
	},
	actions: {
		log(){
			console.log('Logged ;)')
		}
	},
	formatters: {
		upper: s => String(s).toUpperCase()
	}
})