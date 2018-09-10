describe('Computed properties', () => {
	it('works', () => {
		cy.window().then(({instance: i}) => {
			expect(i.sentence).to.equal('My name is ' + i.name)
		})
	})
	it('prevents assigning value to them', () => {
		cy.window().then(({instance: i}) => {
			i.sentence = 'lol'
			expect(i.sentence).to.not.equal('lol')
		})
	})
})