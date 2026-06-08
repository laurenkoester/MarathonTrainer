import { useState, useMemo } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useLog } from '../../hooks/useLog';
import { WORKOUT_TYPES } from '../../utils/workoutTypes';
import LogEntryEdit from '../log/LogEntryEdit';

function effortColor(diff) {
  if (diff <= 3) return 'text-emerald-600';
  if (diff <= 6) return 'text-amber-600';
  return 'text-red-600';
}

export default function LogTable() {
  const { entries, dispatch } = useLog();
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [editingId, setEditingId] = useState(null);

  const sorted = useMemo(() => {
    return [...entries].sort((a, b) => {
      let av = a[sortKey];
      let bv = b[sortKey];
      if (sortKey === 'miles' || sortKey === 'diff') {
        av = parseFloat(av) || 0;
        bv = parseFloat(bv) || 0;
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [entries, sortKey, sortDir]);

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const columns = [
    { key: 'displayDate', label: 'Date' },
    { key: 'wk', label: 'Week' },
    { key: 'ty', label: 'Type' },
    { key: 'actualWo', label: 'Workout' },
    { key: 'miles', label: 'Miles' },
    { key: 'pace', label: 'Pace' },
    { key: 'diff', label: 'Effort' },
    { key: 'notes', label: 'Notes' },
  ];

  if (entries.length === 0) {
    return (
      <p className="text-center text-muted py-8">No workouts logged yet.</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface/50">
            {columns.map(col => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                className="cursor-pointer px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-muted hover:text-dark"
              >
                {col.label} {sortKey === col.key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </th>
            ))}
            <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(entry => (
            editingId === entry.id ? (
              <tr key={entry.id} className="border-b border-border">
                <td colSpan={columns.length + 1} className="p-4">
                  <LogEntryEdit
                    entry={entry}
                    date={new Date(entry.date + 'T00:00:00')}
                    onDone={() => setEditingId(null)}
                  />
                </td>
              </tr>
            ) : (
              <tr key={entry.id} className="border-b border-border hover:bg-surface/30">
                <td className="px-4 py-3 whitespace-nowrap">{entry.displayDate}</td>
                <td className="px-4 py-3">{entry.wk}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-semibold">
                    {WORKOUT_TYPES[entry.ty]?.label ?? entry.ty}
                  </span>
                </td>
                <td className="px-4 py-3 max-w-[200px] truncate">{entry.actualWo}</td>
                <td className="px-4 py-3">{entry.miles}</td>
                <td className="px-4 py-3">{entry.pace}</td>
                <td className={`px-4 py-3 font-bold ${effortColor(entry.diff)}`}>{entry.diff}</td>
                <td className="px-4 py-3 max-w-[150px] truncate text-muted">{entry.notes}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => setEditingId(entry.id)} className="text-muted hover:text-accent">
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => dispatch({ type: 'DELETE_ENTRY', id: entry.id })}
                      className="text-muted hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          ))}
        </tbody>
      </table>
    </div>
  );
}
