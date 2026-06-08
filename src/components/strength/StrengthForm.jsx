import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useStrength } from '../../hooks/useStrength';
import { formatShort, formatISO, getCurrentWeekIndex } from '../../utils/dates';
import { getCorePhaseForWeek } from '../../data/corePhases';
import { usePlan } from '../../hooks/usePlan';

const emptyExercise = { name: '', sets: 3, reps: 10, weight: '', notes: '' };

export default function StrengthForm({ onDone }) {
  const { dispatch } = useStrength();
  const { plan } = usePlan();
  const currentWi = getCurrentWeekIndex() ?? 0;
  const currentWk = plan[currentWi]?.wk ?? 1;
  const defaultPhase = getCorePhaseForWeek(currentWk).name;

  const [date, setDate] = useState(formatISO(new Date()));
  const [phase, setPhase] = useState(defaultPhase);
  const [exercises, setExercises] = useState([{ ...emptyExercise }]);
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');

  function updateExercise(i, field, value) {
    setExercises(prev => prev.map((ex, idx) => idx === i ? { ...ex, [field]: value } : ex));
  }

  function addExercise() {
    setExercises(prev => [...prev, { ...emptyExercise }]);
  }

  function removeExercise(i) {
    setExercises(prev => prev.filter((_, idx) => idx !== i));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const d = new Date(date + 'T00:00:00');
    dispatch({
      type: 'ADD_ENTRY',
      entry: {
        id: Date.now(),
        date,
        displayDate: formatShort(d),
        wk: currentWk,
        phase,
        exercises: exercises.filter(ex => ex.name.trim()),
        duration: parseInt(duration) || 0,
        notes,
      },
    });
    onDone?.();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-white p-5 shadow-sm">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-muted">Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full rounded-lg border border-border p-3 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-muted">Phase</label>
          <select
            value={phase}
            onChange={e => setPhase(e.target.value)}
            className="w-full rounded-lg border border-border p-3 text-sm"
          >
            <option>Foundation</option>
            <option>Progressive</option>
            <option>Maintenance</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted">Exercises</label>
        <div className="space-y-3">
          {exercises.map((ex, i) => (
            <div key={i} className="flex flex-wrap items-end gap-2 rounded-lg bg-surface/50 p-3">
              <input
                placeholder="Exercise name"
                value={ex.name}
                onChange={e => updateExercise(i, 'name', e.target.value)}
                className="min-w-[140px] flex-1 rounded border border-border p-2 text-sm"
              />
              <input
                type="number"
                placeholder="Sets"
                value={ex.sets}
                onChange={e => updateExercise(i, 'sets', e.target.value)}
                className="w-16 rounded border border-border p-2 text-sm"
              />
              <input
                type="number"
                placeholder="Reps"
                value={ex.reps}
                onChange={e => updateExercise(i, 'reps', e.target.value)}
                className="w-16 rounded border border-border p-2 text-sm"
              />
              <input
                placeholder="Weight"
                value={ex.weight}
                onChange={e => updateExercise(i, 'weight', e.target.value)}
                className="w-20 rounded border border-border p-2 text-sm"
              />
              <input
                placeholder="Notes"
                value={ex.notes}
                onChange={e => updateExercise(i, 'notes', e.target.value)}
                className="min-w-[100px] flex-1 rounded border border-border p-2 text-sm"
              />
              {exercises.length > 1 && (
                <button type="button" onClick={() => removeExercise(i)} className="text-red-400">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addExercise}
          className="mt-2 flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
        >
          <Plus size={16} /> Add exercise
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-muted">Duration (min)</label>
          <input
            type="number"
            value={duration}
            onChange={e => setDuration(e.target.value)}
            className="w-full rounded-lg border border-border p-3 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-muted">Session notes</label>
          <input
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full rounded-lg border border-border p-3 text-sm"
          />
        </div>
      </div>

      <button type="submit" className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600">
        Save Session
      </button>
    </form>
  );
}
