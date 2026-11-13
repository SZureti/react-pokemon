describe("Team builder landing page", () => {
  // Check that the initial screen gives the user a clear starting point.
  it("shows the supplied hero and six empty slots", () => {
    cy.visit("/");
    cy.get("h1").should("contain.text", "Build your");
    cy.get('img[alt="Pokémon logo"]').should("be.visible");
    cy.get(".empty-slot").should("have.length", 6);
    cy.contains("button", "Build a team").should("be.enabled");
  });
});
