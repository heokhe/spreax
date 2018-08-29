describe('On directive', () => {
	it('works only once when using ".once"', () => {
		cy.get('#model').within(() => {
			cy
				.get('button').click()
				.get('input').first().should('have.value', '').type(':|')
				.get('button').click()
				.get('input').first().should('not.have.value', '')
		})
	})
})