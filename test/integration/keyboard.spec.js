/// <reference types='Cypress' />

it('handles keyboard events', () => {
	cy.visit('/onkeydown')
		.get('#btn').type('{shift}{enter}')
		.get('h1').should('have.text', 'no')
		.get('#btn').type('{enter}')
		.get('h1').should('have.text', 'yes')
})