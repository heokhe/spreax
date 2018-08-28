/**
 * @param {Array} arr 
 * @returns {Array}
 */
export default function arrayUnique(arr){
	return arr.filter((elem, pos) => arr.indexOf(elem) === pos)
}