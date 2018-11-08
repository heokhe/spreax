describe('Style directive', () => {
	it('works', () => {
		cy.window().then(({ instance }) => {
			const selector = '#style > h1';

			cy.get(selector)
				.should('have.css', 'padding-left', `${instance.number}px`)
				.should('have.css', 'color')
				.then(() => instance.number = 20)
				.get(selector).should('have.css', 'padding-left', '20px');
		});
	});
});