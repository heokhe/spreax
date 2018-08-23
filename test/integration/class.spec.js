/// <reference types="Cypress" />

describe('class directive', () => {
	it('works', () => {
		cy.visit('/class')
			.get('h1').should('not.have.class', 'ud').should('have.class', 'active')
			.get('button').first().click()
			.get('h1').should('not.have.class', 'active')
			.get('button').last().trigger('mouseover')
			.get('h1').should('have.class', 'ud')
	})
})