/**
 * @typedef {(string[]|number[])} arr
 * @param {arr} arr 
 * @returns {arr}
 */
export default function arrayUnique(arr){
	return arr.filter((elem, pos, _arr) => arr.indexOf(elem) === pos)
}