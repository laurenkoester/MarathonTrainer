import { useState } from 'react';
import { X } from 'lucide-react';
import { usePlan } from '../../hooks/usePlan';

export default function WorkoutEditModal({ wi, di, workout, onClose }) {
  const { dispatch } = usePlan();
  const [text, setText] = useState(workout);

  function handleSave() {
    dispatch({ type: 'EDIT_DAY', wi, di, workout: text });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-2xl tracking-widest">Edit Workout</h3>
          <button onClick={onClose} className="text-muted hover:text-dark">
            <X size={20} />
          </button>
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={5}
          className="w-full rounded-lg border border-border p-3 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <p className="mt-2 text-xs text-muted">
          Use | to separate run from core (e.g. &quot;6 mi easy | Core: dead bugs&quot;)
        </p>
        <div className="mt-4 flex gap-3">
          <button
            onClick={handleSave}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
