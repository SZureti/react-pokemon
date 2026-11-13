import { api, stubTeam, visitWithFixedRandom } from "../support/pokemon";

describe("Request error recovery", () => {
  // Fail just the first lead request so a second click can exercise recovery.
  it("shows a request error and lets the user retry", () => {
    stubTeam();
    cy.intercept({ method: "GET", url: `${api}/pokemon/1/`, times: 1 }, { statusCode: 503 });
    visitWithFixedRandom();
    cy.contains("button", "Build a team").click();
    cy.get('[role="alert"]').should("contain.text", "Try again");
    cy.contains("button", "Build a team").click();
    cy.get(".pokemon-card").should("have.length", 6);
    cy.get('[role="alert"]').should("not.exist");
  });
});
