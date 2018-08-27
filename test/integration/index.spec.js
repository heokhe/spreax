/// <reference types='Cypress' />

describe('Hdash', () => {
	before(() => {
		cy.visit('/')
	})
	it('interpolates text', () => {
		cy.get('h1').first().should('not.match', /\{ \w+ \}/)
	})
	it('works with "model" directive', () => {
		cy.get('#model').within(() => {
			cy
				.get('input').should('not.have.value', '').clear().type('hosein')
				.get('div>b').should('have.text', 'hosein')
				.get('div').then(e => {
					expect(e.text()).to.match(/HOSEIN$/)
				})
				.get('button').click()
				.get('input').should('have.value', '').type('(this should not be cleared)')
				.get('button').click()
				.get('input').should('not.have.value', '')
		})
	})
	it('parses "on" shortcuts', () => {
		cy.get('#on-shortcuts').within(() => {
			cy
				.get('div').should('be.empty')
				.get('button').eq(0).click()
				.get('div').should('have.text', 'null')
				.get('button').eq(1).click()
				.get('div').should('have.text', '90.5')
				.get('button').eq(2).click()
				.get('div').should('have.text', 'Hello!')
				.get('button').eq(3).click()
				.get('div').should('be.empty')
		})
	})
	it('works with "class" directive', () => {
		cy.get('#class').within(() => {
			cy
				.get('h1').should('have.class', 'cls')
				.get('button').click()
				.get('h1').should('not.have.class', 'cls')
		})
	})
})