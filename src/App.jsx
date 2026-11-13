import { useState } from "react";
import axios from "axios";
// Vite resolves this local asset to the correct URL in development and production.
import heroImg from "./assets/hero.png";
import "./App.css";

// A shared Axios client to keep the API paths short. Added so the timeout lets the user retry if a request stalls.
const api = axios.create({
  baseURL: "https://pokeapi.co/api/v2/",
  timeout: 10000,
});
// The lead counts toward the six slots. Only the lead draw is limited to the original 151.
const teamSize = 6;
const kantoCount = 151;

// PokéAPI names use hyphens. Format them for display and pad IDs to at least three digits.
const displayName = (name) => name.replaceAll("-", " ");
const numberLabel = (number) => String(number).padStart(3, "0");

// Load a complete roster before the UI replaces the team it's currently showing.
async function buildTeam() {
  // Math.random() starts at zero, so add one to get an ID from 1 through 151.
  const randomId = 1 + Math.floor(Math.random() * kantoCount);
  const { data: lead } = await api.get(`pokemon/${randomId}/`);
  // The first type is the lead’s primary type. Use its endpoint to find Pokémon with that type.
  const type = lead.types[0].type.name;
  const { data } = await api.get(`type/${type}/`);
  // Keep only the names needed for detail requests, and exclude the lead from its own team.
  const candidates = data.pokemon
    .map(({ pokemon }) => pokemon.name)
    .filter((name) => name !== lead.name);

  // Stop early if the API cannot supply enough distinct teammates to fill the roster.
  if (candidates.length < teamSize - 1) {
    throw new Error("Too few Pokémon for this type");
  }

  // Draw without replacement. Removing each pick from the pool prevents duplicates.
  const teammates = Array.from({ length: teamSize - 1 }, () => {
    const index = Math.floor(Math.random() * candidates.length);
    const [name] = candidates.splice(index, 1);
    // Store each request as a promise so the five detail requests can run concurrently.
    return api.get(`pokemon/${name}/`).then(({ data: pokemon }) => pokemon);
  });

  // Wait for every detail request and keep the lead first so the UI can label it.
  return { type, members: [lead, ...(await Promise.all(teammates))] };
}

// Each card receives one Pokémon and whether it was the lead for this draw.
function PokemonCard({ pokemon, isLead }) {
  // Track image failures per card so a broken image can be replaced with an icon.
  const [imageFailed, setImageFailed] = useState(false);
  // Prefer official artwork. Optional chaining handles missing artwork fields, and ?? falls back to the sprite.
  const image =
    pokemon.sprites.other?.["official-artwork"]?.front_default ??
    pokemon.sprites.front_default;

  return (
    <li className="pokemon-card">
      {/* Show the Pokédex number on every card and label only the lead. */}
      <div className="card-meta">
        <span>#{numberLabel(pokemon.id)}</span>
        {isLead && <span className="lead-label">Team lead</span>}
      </div>
      <div className="card-art">
        {image && !imageFailed ? (
          <img
            src={image}
            alt={displayName(pokemon.name)}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="ball" aria-label="Image unavailable" role="img" />
        )}
      </div>
      <h3>{displayName(pokemon.name)}</h3>
      {/* List every type the Pokémon has, including any secondary type. */}
      <ul className="types" aria-label="Types">
        {pokemon.types.map(({ type }) => (
          <li key={type.name} className="type-badge">
            {type.name}
          </li>
        ))}
      </ul>
    </li>
  );
}

function App() {
  // Keep the last successful team, pending request state, and error message separate.
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Start a fresh request on click and clear any error from an earlier attempt.
  async function handleBuildTeam() {
    setLoading(true);
    setError("");

    // Update the roster only after a full team arrives, so a failed redraw leaves the old team visible.
    try {
      setTeam(await buildTeam());
    } catch {
      setError("Couldn’t build a team. Try again in a moment.");
      // Restore the button after either outcome so the user can generate again or retry.
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* The shared shell class aligns the header, main content, and footer. */}
      <header className="site-header shell">
        <span className="brand">
          <span className="ball" aria-hidden="true" /> Pokémon Theme Team
        </span>
        <span className="header-note">Team builder</span>
      </header>

      <main className="shell">
        {/* Label the hero section with its heading for assistive technology. */}
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="accent-dot" /> Random team generator
            </p>
            <h1 id="hero-title">
              Build your
              <br className="hero-break" /> Pokémon team.
            </h1>
            <p className="hero-description">
              Meet a random team lead and five Pokémon that share its primary
              type.
            </p>
            {/* Disable repeat clicks during a request. The text describes the current action or state. */}
            <button type="button" onClick={handleBuildTeam} disabled={loading}>
              {loading
                ? "Building team…"
                : team
                  ? "Build another team"
                  : "Build a team"}
              <span
                aria-hidden="true"
                className={loading ? "spinner" : "button-arrow"}
              >
                {!loading && "→"}
              </span>
            </button>
          </div>
          <div className="hero-art">
            {/* The original dimensions reserve the right aspect ratio before the image loads. */}
            <img src={heroImg} width="860" height="484" alt="Pokémon logo" />
          </div>
        </section>

        <section className="roster" aria-labelledby="roster-title">
          <div className="roster-header">
            <h2 id="roster-title">Your team</h2>
            <span className="roster-count">{team ? "06 / 06" : "00 / 06"}</span>
          </div>
          {/* The live status announces loading and the result. Request failures use an alert below. */}
          <p className="roster-status" role="status">
            {loading ? (
              "Finding Pokémon for your team…"
            ) : team ? (
              <>
                All six Pokémon share the{" "}
                <strong className="type-name">{team.type}</strong> type.
              </>
            ) : (
              "Build a team to fill these six slots."
            )}
          </p>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          {/* Swap the decorative empty slots for a semantic list once a full team is ready. */}
          {team ? (
            <ul className="team-grid" aria-label="Team roster">
              {/* Use Pokémon IDs as stable React keys when the roster changes. */}
              {team.members.map((pokemon, index) => (
                <PokemonCard
                  key={pokemon.id}
                  pokemon={pokemon}
                  isLead={index === 0}
                />
              ))}
            </ul>
          ) : (
            <div className="team-grid" aria-hidden="true">
              {Array.from({ length: teamSize }, (_, index) => (
                <div className="empty-slot" key={index}>
                  <span className="ball" />
                  <span>Slot {String(index + 1).padStart(2, "0")}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Credit the source of the roster data and card artwork. */}
      <footer className="site-footer shell">
        Pokémon data and artwork from <a href="https://pokeapi.co/">PokéAPI</a>.
      </footer>
    </>
  );
}

export default App;
