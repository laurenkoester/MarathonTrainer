import { useState } from 'react';
import { inferType } from '../../utils/workoutTypes';
import { formatShort, formatDayName, formatISO } from '../../utils/dates';
import { useLog } from '../../hooks/useLog';

function effortColor(n) {
  if (n <= 3) return 'bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200';
  if (n <= 6) return 'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200';
  return 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200';
}

function effortSelectedColor(n) {
  if (n <= 3) return 'bg-emerald-500 text-white border-emerald-500';
  if (n <= 6) return 'bg-amber-500 text-white border-amber-500';
  return 'bg-red-500 text-white border-red-500';
}

export default function LogForm({
  plannedWorkout,
  date,
  wk,
  initialValues = {},
  onSubmit,
  compact = false,
}) {
  const [actualWo, setActualWo] = useState(initialValues.actualWo ?? plannedWorkout?.split('|')[0]?.trim() ?? '');
  const [miles, setMiles] = useState(initialValues.miles ?? '');
  const [pace, setPace] = useState(initialValues.pace ?? '');
  const [diff, setDiff] = useState(initialValues.diff ?? null);
  const [notes, setNotes] = useState(initialValues.notes ?? '');

  function handleSubmit(e) {
    e.preventDefault();
    if (!diff) return;

    const runPart = plannedWorkout?.split('|')[0]?.trim() ?? '';
    onSubmit({
      id: initialValues.id ?? Date.now(),
      date: formatISO(date),
      displayDate: formatShort(date),
      dn: formatDayName(date),
      wk,
      wo: runPart,
      ty: inferType(actualWo || plannedWorkout || ''),
      actualWo,
      miles,
      pace,
      diff,
      notes,
      stravaId: initialValues.stravaId ?? null,
      stravaName: initialValues.stravaName ?? null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${compact ? '' : 'rounded-xl border border-border bg-white p-5 shadow-sm'}`}>
      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-muted">
          What did you actually do?
        </label>
        <textarea
          value={actualWo}
          onChange={e => setActualWo(e.target.value)}
          placeholder={plannedWorkout?.split('|')[0]?.trim()}
          rows={compact ? 2 : 3}
          className="w-full rounded-lg border border-border p-3 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <div className={`grid gap-4 ${compact ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-muted">
            Actual mileage
          </label>
          <input
            type="number"
            step="0.1"
            value={miles}
            onChange={e => setMiles(e.target.value)}
            className="w-full rounded-lg border border-border p-3 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-muted">
            Avg pace (min/mi)
          </label>
          <input
            type="text"
            placeholder="9:45"
            value={pace}
            onChange={e => setPace(e.target.value)}
            className="w-full rounded-lg border border-border p-3 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted">
          Effort rating
        </label>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => setDiff(n)}
              className={`h-11 w-11 rounded-full border text-sm font-semibold transition-colors ${
                diff === n ? effortSelectedColor(n) : effortColor(n)
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-muted">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-border p-3 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <button
        type="submit"
        disabled={!diff}
        className="w-full rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
      >
        Save Log
      </button>
    </form>
  );
}

export function LogFormWithDispatch(props) {
  const { dispatch } = useLog();

  return (
    <LogForm
      {...props}
      onSubmit={(entry) => {
        dispatch({ type: 'ADD_ENTRY', entry });
        props.onDone?.();
      }}
    />
  );
}
