export default function(d){
	let o = `sp-${d.name}`;
	if (d.arg) o += ':' + d.arg;
	let k = Object.keys(d.modifiers);
	if (k.length) o += '.' + k.join('.');
	return o;
}