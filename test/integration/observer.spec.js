/// <reference types='Cypress' />

describe('observer', () => {
	it('attaches directives', () => {
		cy.visit('/observer')
			.get('input').type('hello')
			.get('h1').should('have.text', 'hello')
			.get('button').click()
			.get('input').should('have.value', '')
			.get('h1').should('have.text', 'null')
	})
})