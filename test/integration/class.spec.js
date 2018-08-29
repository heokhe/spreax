describe('Class directive', () => {
	it('initially adds class', () => {
		cy.get('#class > h1').should('have.class', 'cls')
	})
	it('works', () => {
		cy.get('#class').within(() => {
			cy
				.get('button').click()
				.get('h1').should('not.have.class', 'cls')
		})
	})
})