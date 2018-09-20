describe('Observer', () => {
	it('works', () => {
		cy.window().then(window => {
			const { document, instance } = window;

			let div = document.createElement('div');
			div.id = 'o';
			div.innerHTML = '{ name }';
			instance.$el.appendChild(div);

			cy.get('#o')
				.should('have.text', instance.name)
				.invoke('text', '{ checkbox }')
				.then(el => {
					expect(el.text()).to.match(/^\{/);
					el.remove();
				});
		});
	});
});