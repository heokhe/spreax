describe('Templates', () => {
	it('works', () => {
		cy.get('#template').within(() => {
			cy.get('div').eq(0).should('have.text', 'my name is Hosein')
		})
	})
	it('works with formatters', () => {
		cy.get('#template div').eq(1).then(div => {
			const text = div[0].innerHTML.split('is')[1].trim()
			expect(text).to.match(/^[A-Z]+$/)
		})
	})
})