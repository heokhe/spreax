/// <reference types='Cypress' />

it('works with <textarea>', () => {
cy.visit('/textarea')
	.get('textarea')
	.type('a line{enter}another line')
	.get('div[r-text]')
	.should('not.contain', '\n')
	.get('div[r-text]>br').should('exist')
})