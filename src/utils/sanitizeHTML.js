/**
 * Sanitizes HTML input.
 * @param {string} html 
 * @returns {string}
 */
export default function sanitizeHTML(html){
	return html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
}