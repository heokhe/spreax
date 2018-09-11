describe('On directive', () => {
	it('works only once when using ".once"', () => {
		cy.get('#model').within(() => {
			cy
				.get('button').click()
				.get('input').first().should('have.value', '').type('Bob')
				.get('button').click()
				.get('input').first().should('have.value', 'Bob');
		});
	});
});