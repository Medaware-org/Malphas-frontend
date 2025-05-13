describe('Register', () => {
    const username = 'testuser';
    const password = 'testpass';

    it('Registers and logs out', () => {
        cy.visit('/');

        cy.get('[data-cy="register"]').click();

        cy.get('[data-cy="username"]').type(username);
        cy.get('[data-cy="password"]').type(password);
        cy.contains('Register').click();

        cy.contains('Log In').should('exist');
    });
});

describe('Login', () => {
    const username = 'testuser';
    const password = 'testpass';

    it('Logs in', () => {
        cy.visit('/');
        cy.get('[data-cy="login"]').click();

        cy.get('[data-cy="username"]').type(username);
        cy.get('[data-cy="password"]').type(password);
        cy.contains('Log In').click();

	cy.url().should('include', '/dash');
    });
});
