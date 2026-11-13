// Fixed names and a shared type make assertions independent of live API data.
export const api = "https://pokeapi.co/api/v2";
export const names = ["bulbasaur", "ivysaur", "venusaur", "oddish", "gloom", "vileplume"];
const grass = { type: { name: "grass" } };

// Intercept the same endpoints the app uses, so this suite runs without PokéAPI.
export function stubTeam({ leadDelay = 0 } = {}) {
  cy.intercept("GET", `${api}/type/grass/`, {
    pokemon: names.map((name) => ({ pokemon: { name } })),
  }).as("type");

  // The lead is requested by ID, and teammates are requested by name.
  cy.intercept("GET", `${api}/pokemon/*/`, (request) => {
    const identifier = new URL(request.url).pathname.split("/").at(-2);
    const index = identifier === "1" ? 0 : names.indexOf(identifier);
    request.reply({
      // Delay the lead response so the test can observe the pending state.
      delay: index === 0 ? leadDelay : 0,
      body: {
        id: index + 1,
        name: names[index],
        types: [grass, ...(index === 0 ? [{ type: { name: "poison" } }] : [])],
        // Use a local image to avoid depending on a separate image host.
        sprites: { front_default: "/favicon.svg" },
      },
    });
  }).as("pokemon");
}

// Give each spec a fresh page and a predictable lead and teammate order.
export function visitWithFixedRandom() {
  cy.visit("/", {
    onBeforeLoad(window) {
      // Zero always selects ID 1 and then the first remaining teammate.
      cy.stub(window.Math, "random").returns(0);
    },
  });
}
