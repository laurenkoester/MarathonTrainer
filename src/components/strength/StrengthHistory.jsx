import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useStrength } from '../../hooks/useStrength';

export default function StrengthHistory() {
  const { entries, dispatch } = useStrength();
  const [expandedId, setExpandedId] = useState(null);

  if (entries.length === 0) {
    return <p className="text-center text-muted py-8">No strength sessions logged yet.</p>;
  }

  const sorted = [...entries].sort((a, b) => b.id - a.id);

  return (
    <div className="space-y-3">
      {sorted.map(entry => (
        <div key={entry.id} className="rounded-xl border border-border bg-white shadow-sm">
          <button
            onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
            className="flex w-full items-center justify-between p-4 text-left"
          >
            <div>
              <span className="font-semibold">{entry.displayDate}</span>
              <span className="ml-2 text-xs text-muted">Week {entry.wk}</span>
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
                {entry.phase}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted">
                {entry.exercises.length} exercises · {entry.duration} min
              </span>
              {expandedId === entry.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </button>

          {expandedId === entry.id && (
            <div className="border-t border-border px-4 pb-4">
              <ul className="mt-3 space-y-2">
                {entry.exercises.map((ex, i) => (
                  <li key={i} className="text-sm">
                    <span className="font-medium">{ex.name}</span>
                    {' — '}
                    {ex.sets}×{ex.reps}
                    {ex.weight && ` @ ${ex.weight}`}
                    {ex.notes && <span className="text-muted"> ({ex.notes})</span>}
                  </li>
                ))}
              </ul>
              {entry.notes && (
                <p className="mt-2 text-xs italic text-muted">{entry.notes}</p>
              )}
              <button
                onClick={() => dispatch({ type: 'DELETE_ENTRY', id: entry.id })}
                className="mt-3 flex items-center gap-1 text-xs font-semibold text-red-500 hover:underline"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
