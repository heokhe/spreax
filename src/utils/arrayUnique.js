/**
 * @param {Array} arr 
 * @returns {Array}
 */
export default function (arr){
	return arr.filter((elem, pos) => arr.indexOf(elem) === pos);
}