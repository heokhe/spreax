describe('Text interpolation feature', () => {
	it('works', () => {
		cy.get('#interpolation').within(() => {
			cy
				.get('div').eq(0).should('have.text', 'my name is Hosein')
				.window().then(({instance}) => {
					instance.name = 'Tom';
				})
				.get('div').eq(0).should('have.text', 'my name is Tom');
		});
	});
	it('works with formatters', () => {
		cy.get('#interpolation div').eq(1).then(div => {
			const text = div[0].innerHTML.split('is')[1].trim();
			expect(text).to.match(/^[A-Z]+$/);
		});
	});
});