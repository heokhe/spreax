describe('Class directive', () => {
	it('initially adds class', () => {
		cy.get('#class > div').should('have.class', 'active').and('have.text', 'true')
	})
	it('works', () => {
		cy.get('#class').within(() => {
			cy
				.get('button').click()
				.get('div')
					.should('not.have.class', 'cls')
					.and('have.text', 'false')
					.and('not.have.attr', 'class')
		})
	})
})