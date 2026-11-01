
import { useId, useState } from 'react';
import { PUBG_VN_SQUADS } from './data/pubgSquads.js';
import PubgMatchTelemetry from './components/PubgMatchTelemetry.jsx';
import './App.css';

export default function App() {
  const [selectedSquadId, setSelectedSquadId] = useState('te');
  const squadSelectId = useId();

  return (
    <main>
      <section aria-labelledby="squad-selector-title">
        <header>
          <h1 id="squad-selector-title">
            PUBG Vietnam Squad Radar
          </h1>
          <p>
            Select a squad to inspect simulated match telemetry.
          </p>
        </header>

        <label htmlFor={squadSelectId}>
          Select squad:
        </label>

        <select
          id={squadSelectId}
          value={selectedSquadId}
          onChange={(event) =>
            setSelectedSquadId(event.target.value)
          }
        >
          {PUBG_VN_SQUADS.map((squad) => (
            <option key={squad.id} value={squad.id}>
              {squad.name}
            </option>
          ))}
        </select>
      </section>

      <PubgMatchTelemetry squadId={selectedSquadId} />
    </main>
  );
}
