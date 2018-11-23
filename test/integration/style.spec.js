describe('Style directive', () => {
	it('works', () => {
		cy.window().then(({ instance }) => {
			const target = '#style > h1'

			cy.get(target)
				.should('have.css', 'padding-left', `${instance.number}px`)
				.should('have.css', 'color', 'rgb(255, 0, 0)')
				.then(() => instance.number = 20)
				.get(target).should('have.css', 'padding-left', '20px')
		})
	})
})