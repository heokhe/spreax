export default function(d){
	let o = `sp-${d.name}`
	if (d.arg) o += `:${  d.arg}`
	const k = Object.keys(d.modifiers)
	if (k.length) o += `.${  k.join('.')}`
	return o
}