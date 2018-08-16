/// <reference types='Cypress' />

describe('text directive', () => {
	it('works', () => {
		cy.visit('/text')
			.get('#hasv').should('not.be.empty')
			.get('#nov').should('not.match', /\{\{/g)
			.get('#nov>i').should('not.be.empty')
	})
})