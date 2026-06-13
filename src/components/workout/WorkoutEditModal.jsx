import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { usePlan } from '../../hooks/usePlan';
import { INITIAL_PLAN } from '../../data/plan';
import { DAY_NAMES, formatShort } from '../../utils/dates';

export default function WorkoutEditModal({ wi, di, workout, date, onClose }) {
  const { dispatch } = usePlan();
  const [text, setText] = useState(workout);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleSave() {
    dispatch({ type: 'EDIT_DAY', wi, di, workout: text.trim() || workout });
    onClose();
  }

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    dispatch({ type: 'EDIT_DAY', wi, di, workout: 'Rest' });
    onClose();
  }

  function handleReset() {
    setText(INITIAL_PLAN[wi].d[di]);
  }

  const dayLabel = date ? `${DAY_NAMES[di]} ${formatShort(date)}` : DAY_NAMES[di];

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Sheet — slides up on mobile, centered modal on sm+ */}
      <div className="w-full rounded-t-2xl border border-border bg-white p-5 shadow-xl sm:max-w-lg sm:rounded-xl sm:p-6">
        <div className="mb-1 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted">{dayLabel}</p>
            <h3 className="font-display text-2xl tracking-widest">Edit Workout</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-surface hover:text-dark"
          >
            <X size={20} />
          </button>
        </div>

        <textarea
          value={text}
          onChange={e => { setText(e.target.value); setConfirmDelete(false); }}
          rows={5}
          className="mt-4 w-full rounded-lg border border-border p-3 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          autoFocus
        />
        <p className="mt-1.5 text-xs text-muted">
          Use <code className="rounded bg-surface px-1">|</code> to separate run from core workout
        </p>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 rounded-lg bg-accent py-3 text-sm font-semibold text-white hover:bg-orange-600 sm:flex-none sm:px-5"
            >
              Save
            </button>
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-border py-3 text-sm hover:bg-surface sm:flex-none sm:px-5"
            >
              Cancel
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="flex-1 rounded-lg border border-border py-3 text-xs text-muted hover:bg-surface sm:flex-none sm:px-4"
            >
              Reset to original
            </button>
            <button
              onClick={handleDelete}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-3 text-sm font-semibold transition-colors sm:flex-none sm:px-4 ${
                confirmDelete
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'border border-red-200 text-red-500 hover:bg-red-50'
              }`}
            >
              <Trash2 size={15} />
              {confirmDelete ? 'Confirm delete' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
