describe('Observer', () => {
	it('works', () => {
		cy.get('#observer').within(() => {
			cy
				.get('h1').should('exist').and('not.match', /\{ [^\}] \}/)
				.get('input').clear().type('🎉')
				.get('h1').should('have.text', '🎉')
		})
	})
})