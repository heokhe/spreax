describe('Computed properties', () => {
	it('works', () => {
		cy.window().then(({instance: i}) => {
			let {name} = i
			const prefix = 'My name is ';
			expect(i.sentence).to.equal(prefix + i.name)
			i.name = 'Jack'
			expect(i.sentence).to.equal(prefix + i.name)
			i.name = name
		})
	})
	it('prevents assigning value to them', () => {
		cy.window().then(({instance: i}) => {
			i.sentence = 'lol'
			expect(i.sentence).to.not.equal('lol')
		})
	})
})