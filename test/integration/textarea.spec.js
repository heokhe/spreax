/// <reference types='Cypress' />

it('works with <textarea>', () => {
	cy.visit('/textarea')
		.get('textarea')
		.type('a{enter}b')
		.get('div[r-text]')
		.should('not.contain', '\n')
		.should('have.html', 'a<br>b')
})