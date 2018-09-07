describe('Model directive', () => {
	it('handles the initial value', () => {
		cy.get('#model > input').first().should('not.have.value', '')
	})
	it('synchronizes the value with state', () => {
		cy.get('#model').within(() => {
			cy
				.get('input').first().clear().type('Hosein')
				.get('div>b').should('have.text', 'Hosein')
				.window().then(window => {
					window.instance.name = 'John'
				})
				.get('input').first().should('have.value', 'John')
				.get('div>b').should('have.text', 'John')
			})
	})
	it('works with checkbox inputs', () => {
		cy.get('#model').within(() => {
			cy
				.get('label').should('have.text', 'false')
				.get('input[type=checkbox]').should('not.be.checked').check()
				.get('label').should('have.text', 'true')
				.window().then(window => {
					window.instance.checkbox = false
				})
				.get('input[type=checkbox]').should('not.be.checked')
		})
	})
})