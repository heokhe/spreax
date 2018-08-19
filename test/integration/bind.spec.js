/// <reference types="Cypress" />

describe('bind directive', () => {
	it('works', () => {
		cy.visit('/bind')
			.get('#t').should('have.attr', 'data-attr', 'a')
			.get('button').click()
			.get('#t').should('have.attr', 'data-attr', 'aa')
	})
})