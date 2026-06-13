import { useState } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import StrengthForm from '../components/strength/StrengthForm';
import StrengthHistory from '../components/strength/StrengthHistory';
import { CORE_PHASES, getCorePhaseForWeek } from '../data/corePhases';
import { getCurrentWeekIndex } from '../utils/dates';
import { usePlan } from '../hooks/usePlan';

export default function Strength() {
  const { plan } = usePlan();
  const [showForm, setShowForm] = useState(false);
  const currentWi = getCurrentWeekIndex() ?? 0;
  const currentWk = plan[currentWi]?.wk ?? 1;
  const currentPhase = getCorePhaseForWeek(currentWk);

  return (
    <PageWrapper>
      <h1 className="font-display text-3xl tracking-widest sm:text-4xl">Strength Log</h1>

      <div className="mt-6 rounded-xl border border-border bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-muted">Current Phase</p>
        <p className="mt-1 text-lg font-semibold">{currentPhase.name} · Weeks {currentPhase.weeks}</p>
        <p className="mt-2 text-sm text-muted">{currentPhase.description}</p>
      </div>

      <details className="mt-4 rounded-xl border border-border bg-white p-5 shadow-sm">
        <summary className="cursor-pointer text-xs font-bold uppercase tracking-widest text-muted">
          Core Phase Reference
        </summary>
        <div className="mt-4 space-y-4">
          {CORE_PHASES.map(phase => (
            <div key={phase.name}>
              <p className="font-semibold">{phase.name} (Weeks {phase.weeks})</p>
              <ul className="mt-1 list-inside list-disc text-sm text-muted">
                {phase.exercises.map(ex => (
                  <li key={ex}>{ex}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </details>

      <div className="mt-6">
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 sm:w-auto"
          >
            Log new session
          </button>
        ) : (
          <StrengthForm onDone={() => setShowForm(false)} />
        )}
      </div>

      <div className="mt-8">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">History</p>
        <StrengthHistory />
      </div>
    </PageWrapper>
  );
}
