/// <reference types="Cypress" />

describe('text, model and on directives', () => {
	it('works', () => {
		let name = 'cypress'
		cy.visit('/input')
			.get('input')
			.type(name)
			.get('h1>b')
			.should('have.text', name)
			.get('button').click()
			.get('input').should('be.empty')
			.type(name)
			// click event should work only once because we are using --once
			.get('button').click()
			.get('h1>b').should('have.text', name)
	})
})