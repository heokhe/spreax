describe('Model directive', () => {
	it('handles the initial value', () => {
		cy.get('#model > input').first().should('not.have.value', '')
	})
	it('synchronizes the value with state', () => {
		cy.get('#model').within(() => {
			cy
				.get('input').first().clear().type('Hosein')
				.get('div').should('have.text', 'Hosein')
				.window().then(window => {
					window.instance.state.model = 'x'
				})
				.get('input').should('have.value', 'x')
		})
	})
	it('works with checkbox inputs', () => {
		cy.get('#model').within(() => {
			cy
				.get('label').should('have.text', 'false')
				.get('input[type=checkbox]').should('not.be.checked').check()
				.get('label').should('have.text', 'true')
				.window().then(window => {
					window.instance.state.checkbox = false
				})
				.get('input[type=checkbox]').should('not.be.checked')
		})
	})
})