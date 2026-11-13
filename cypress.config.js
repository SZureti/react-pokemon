import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    // Vite's default dev-server port. If Vite reports a different port
    // (it bumps to 5174+ when 5173 is taken), change this to match.
    baseUrl: "http://localhost:5173",
    supportFile: "cypress/support/e2e.js",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx}",
    viewportWidth: 1280,
    viewportHeight: 800,
    // Keep the local run light; flip video on if you want recordings.
    video: false,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      return config;
    },
  },
});
