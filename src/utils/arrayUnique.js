/**
 * @param {Array} arr 
 * @returns {Array}
 */
export default function arrayUnique(arr){
	return arr.filter((elem, pos, _arr) => arr.indexOf(elem) === pos)
}