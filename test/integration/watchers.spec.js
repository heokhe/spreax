/// <reference types="Cypress" />

describe('watchers', () => {
	it('works', () => {
		cy.visit('/watchers')
			.get('#t').should('have.text', '0')
			.get('button').click()
			.get('#t').should('have.text', '1')
			.get('button').click()
			.get('#t').should('have.text', '2')
	})
})