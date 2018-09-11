describe('Observer', () => {
	it('works', () => {
		cy.get('#observer>span').should('exist').and('not.match', /{ [^}] }/);
	});
});