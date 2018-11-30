describe('Watchers', () => {
	it('works', () => {
		cy.window().then(({console: c, instance}) => {
			cy.spy()
			cy.stub(c, 'log')
			cy.wrap(c).its('log').should('not.be.called').then(() => {
				instance.name = 'Jack'
			}).should('be.calledWithExactly', 'Jack', 'Hosein').then(() => {
				const { name } = instance
				instance.name = name
			}).should('be.calledOnce')
		})
	})
})