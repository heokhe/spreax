describe('Text interpolation feature', () => {
	it('works', () => {
		cy.get('#interpolation').within(() => {
			cy
				.get('span').should('have.text', 'Hosein')
				.get('b').should('have.text', 'HOSEIN')
				.window().then(window => {
					window.instance.int_name = 'x'
				})
				.get('span').should('have.text', 'x')
				.get('b').should('have.text', 'X')
		})
	})
})