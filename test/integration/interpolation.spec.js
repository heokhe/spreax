describe('Text interpolation feature', () => {
	it('works', () => {
		cy.get('#interpolation').within(() => {
			cy
				.get('b').eq(0).should('have.text', 'Hosein')
				.window().then(({instance}) => {
					instance.name = 'Tom'
				})
				.get('b').eq(0).should('have.text', 'Tom')
		})
	})
	it('works with formatters', () => {
		cy.get('#interpolation b').eq(1).should('not.match', /[a-z]/g).and('have.text', 'TOM')
	})
})