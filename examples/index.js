var instance = new Hdash('#app', {
	state: {
		title: 'Hello!',
		model_name: 'type your name',
		sh: '',
		cls: true,
		observer_title: 'if you see this, observer works.'
	},
	formatters: {
		upper: s => s.toUpperCase()
	}
})

setTimeout(() => {
	document.querySelector('#observer').innerHTML = `
		<h3>{ observer_title }</h3>
		<input h-model='observer_title'>
	`
}, 1000)