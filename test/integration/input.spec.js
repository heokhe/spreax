/// <reference types="Cypress" />

describe('text, model and on directives', () => {
	it('works', () => {
		cy.visit('/input')
			.get('input')
			.type('cy')
			.get('h1>b')
			.should('have.text', 'cy')
			.get('button').click()
			.get('input').should('be.empty')
			.type('cy')
			// click event should work only once because we are using --once
			.get('button').click()
			.get('h1>b').should('have.text', 'cy')
	})
	it('trims the value', () => {
		cy.get('input').clear().type('        ')
			.get('h1>b').should('have.html', '')
	})
})