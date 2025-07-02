describe('Flujo de compra', () => {
  it('Login, agrega producto y realiza compra', () => {
    cy.visit('http://localhost:4200/main-login');
    cy.get('input[name="username"]').type('test');
    cy.get('input[name="password"]').type('1234');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/home');
    cy.get('.producto').first().click();
    cy.get('button.agregar-carrito').click();
    cy.get('a[href="/cart"]').click();
    cy.get('button.pagar').click();

    cy.url().should('include', '/checkout-success');
    cy.contains('¡Compra exitosa!');
  });
}); 