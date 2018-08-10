/// <reference types="Cypress" />

it('Works!', () => {
	const getText = win => win.bi.state.text
	cy.visit('/basic-input')
		.get('input')
		.type('cypress')
		.window().then(win => {
			expect(getText(win)).to.equal(win.document.querySelector('input').value)
		})
		.get('h1>b')
		.should('not.be.empty')
		.get('button').click()
		.get('input').should('have.value', 'Hosein')
})