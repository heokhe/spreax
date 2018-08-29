var instance = new Hdash('#app', {
	state: {
		model: 'type your name',
		cls: true,
		observer_title: 'if you see this, observer works.',
		checkbox: false,
		int_name: 'Hosein'
	},
	formatters: {
		upper: s => s.toUpperCase()
	}
})

setTimeout(() => {
	document.querySelector('#observer').innerHTML = `
		<h1>{ observer_title }</h1>
		<input h-model='observer_title'>
	`
}, 1000)