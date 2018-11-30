describe('Watchers', () => {
	it('works', () => {
		cy.window().then(({console: c, instance}) => {
			cy.stub(c, 'log')

			cy.wrap(c).its('log')
				.should('not.be.called').then(() => {
					const oldName = instance.name, newName = 'Jack'
					instance.name = newName
					expect(c.log).to.be.calledWithExactly(newName, oldName)
				}).then(() => {
					// eslint-disable-next-line no-self-assign
					instance.name = instance.name
				}).should('be.calledOnce')
		})
	})
})