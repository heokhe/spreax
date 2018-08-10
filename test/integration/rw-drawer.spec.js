/// <reference types="Cypress" />

describe('Real-world drawer', () => {
	it('works', () => {
		cy.visit('/rw')
			.get('#drawer-open').click()
			.get('.drawer').should('be.visible')
			.get('.drawer button').click()
			.get('.drawer').should('not.be.visible')
	})
})