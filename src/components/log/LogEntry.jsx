import { WORKOUT_TYPES } from '../../utils/workoutTypes';
import WorkoutBadge from '../workout/WorkoutBadge';

function effortBadgeColor(diff) {
  if (diff <= 3) return 'bg-emerald-100 text-emerald-700';
  if (diff <= 6) return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
}

export default function LogEntry({ entry, onEdit, onDelete }) {
  const typeInfo = WORKOUT_TYPES[entry.ty] ?? WORKOUT_TYPES.easy;

  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <span className="text-sm font-semibold">{entry.displayDate}</span>
          <span className="ml-2 text-xs text-muted">{entry.dn}</span>
        </div>
        <div className="flex items-center gap-2">
          <WorkoutBadge workout={entry.wo} />
          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${effortBadgeColor(entry.diff)}`}>
            {entry.diff}/10
          </span>
        </div>
      </div>

      <p className="text-sm font-medium">{entry.actualWo}</p>

      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted">
        {entry.miles && <span>{entry.miles} mi</span>}
        {entry.pace && <span>{entry.pace}/mi</span>}
        {entry.stravaName && (
          <span className="text-orange-600">via Strava: {entry.stravaName}</span>
        )}
      </div>

      {entry.notes && (
        <p className="mt-2 text-xs italic text-gray-500">{entry.notes}</p>
      )}

      {(onEdit || onDelete) && (
        <div className="mt-3 flex gap-2">
          {onEdit && (
            <button onClick={onEdit} className="text-xs font-semibold text-accent hover:underline">
              Edit
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} className="text-xs font-semibold text-red-500 hover:underline">
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
