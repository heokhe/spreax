/// <reference types='Cypress' />
import generateSelectorString from "../../src/utils/generateSelector"

describe('selector string generator', () => {
	it('works', () => {
		cy.visit('/text').window().then(window => {
			let i = window.document.querySelector('i'),
			selector = generateSelectorString(i, window.document.body);

			expect(selector).to.equal('body > #main > #nov > i')
			expect(selector).to.not.match(/> div/g)
		})
	})
})