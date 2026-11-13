import { names, stubTeam, visitWithFixedRandom } from "../support/pokemon";

describe("Team generation", () => {
  // Check the complete roster using a lead with both a primary and a secondary type.
  it("loads six distinct Pokémon that share the lead’s primary type", () => {
    stubTeam();
    visitWithFixedRandom();
    cy.contains("button", "Build a team").click();
    cy.wait("@type");
    cy.get(".pokemon-card").should("have.length", 6);
    cy.get(".pokemon-card img").should("have.length", 6);
    cy.get(".pokemon-card h3").then(($names) => {
      expect([...$names].map((name) => name.textContent)).to.deep.equal(names);
    });
    cy.get('[role="status"]').should("contain.text", "share the grass type");
    cy.contains("button", "Build another team").should("be.enabled");
  });
});
