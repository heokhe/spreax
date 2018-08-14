/// <reference types="Cypress" />

it('Works!', () => {
	const getText = win => win.bi.state.name
	cy.visit('/input')
		.get('input')
		.type('cypress')
		.window().then(win => {
			expect(getText(win)).to.equal(win.document.querySelector('input').value)
		})
		.get('h1>b')
		.should('not.be.empty')
		.get('button').click()
		.get('input').should('be.empty')
})