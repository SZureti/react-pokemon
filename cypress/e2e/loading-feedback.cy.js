import { stubTeam, visitWithFixedRandom } from "../support/pokemon";

describe("Team loading feedback", () => {
  it("shows progress and disables repeat clicks until the team is ready", () => {
    stubTeam({ leadDelay: 1000 });
    visitWithFixedRandom();

    cy.contains("button", "Build a team").click();
    cy.contains("button", "Building team").should("be.disabled");
    cy.get('[role="status"]').should("contain.text", "Finding Pokémon");

    cy.contains("button", "Build another team").should("be.enabled");
  });
});
