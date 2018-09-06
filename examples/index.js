var instance = new Hdash('#app', {
	state: {
		model: 'type your name',
		cls: true,
		observer_title: 'if you see this, observer works.',
		checkbox: false,
		int_name: 'Hosein'
	},
	computed: {
		greetSentence(){
			return `Hello, ${this.int_name}!`
		}
	},
	formatters: {
		upper: s => s.toUpperCase()
	},
	actions: {
		log(){
			console.log('lol')
		}
	}
})

setTimeout(() => {
	document.querySelector('#observer').innerHTML = `
		<h1>{ observer_title }</h1>
		<input h-model='observer_title'>
	`
}, 1000)