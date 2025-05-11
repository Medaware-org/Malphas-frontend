describe('Scene CRUD Flow', () => {
    const sceneName = 'Test Scene';
    const sceneDescription = 'A temporary test scene';
    const updatedName = 'Updated Scene';
    const updatedDescription = 'Updated description';

    before(() => {
        cy.visit('http://localhost:5173');
    });

    it('creates a new scene', () => {
        cy.get('[data-cy="new-scene-button"]').click();

        cy.get('[data-cy="scene-name-input"]').type(sceneName);
        cy.get('[data-cy="scene-desc-input"]').type(sceneDescription);
        cy.get('[data-cy="create-button"]').click();

        cy.get('[data-cy="scene-card-title"]').contains(sceneName).should('exist');
    });

    it('updates the created scene', () => {
        cy.get('[data-cy="scene-card"]')
            .contains(sceneName)
            .parents('[data-cy="scene-card"]')
            .find('[data-cy="edit-button"]').click();

        cy.get('[data-cy="edit-name-input"]').clear().type(updatedName);
        cy.get('[data-cy="edit-desc-input"]').clear().type(updatedDescription);
        cy.get('[data-cy="update-button"]').click();

        cy.get('[data-cy="scene-card-title"]').contains(updatedName).should('exist');
        cy.get('[data-cy="scene-card-title"]').contains(sceneName).should('not.exist');
    });

    it('deletes the updated scene', () => {
        cy.get('[data-cy="scene-card"]')
            .contains(updatedName)
            .parents('[data-cy="scene-card"]')
            .find('[data-cy="delete-button"]').click();

        cy.get('[data-cy="confirm-delete-button"]').click();

        cy.get('[data-cy="scene-card-title"]').contains(updatedName).should('not.exist');
    });

    it('reloads the scene list', () => {
        cy.get('[data-cy="reload-button"]').click();
        cy.get('[data-cy="scene-card-title"]').should('not.contain', updatedName);
    });
});
