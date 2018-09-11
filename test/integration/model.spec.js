describe('Model directive', () => {
	it('handles the initial value', () => {
		cy.get('#model > input').first().should('not.have.value', '');
	});
	it('synchronizes the value with state', () => {
		cy.get('#model').within(() => {
			cy
				.get('input').first().clear().type('Hosein')
				.get('div>b').should('have.text', 'Hosein')
				.window().then(window => {
					window.instance.name = 'Tom';
				})
				.get('input').first().should('have.value', 'Tom')
				.get('div>b').should('have.text', 'Tom');
			});
	});
	it('works with checkbox inputs', () => {
		cy.get('#model').within(() => {
			cy
				.get('label').should('have.text', 'false')
				.get('input[type=checkbox]').should('not.be.checked').check()
				.get('label').should('have.text', 'true')
				.window().then(window => {
					window.instance.checkbox = false;
				})
				.get('input[type=checkbox]').should('not.be.checked');
		});
	});
	it('works with select elements', () => {
		cy.get('#model').within(() => {
			cy
				.get('select').should('have.value', 'Tom')
				.select('Hosein')
				.window().then(w => {
					expect(w.instance.name).to.equal('Hosein');
				});
		});
	});
});