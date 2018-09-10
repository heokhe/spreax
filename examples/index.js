var instance = new Hdash('#app', {
	state: {
		name: 'Hosein',
		checkbox: false,
		classIsActive: true,
		observerTitle: 'If you see this, it works.'
	},
	computed: {
		sentence() {
			return `My name is ${this.name}`
		}
	},
	formatters: {
		upper: s => s.toUpperCase()
	}
})

setTimeout(() => {
	document.querySelector('#observer').insertAdjacentHTML('beforeend', `
		<span>{ observerTitle }</span>
	`)
}, 1000)