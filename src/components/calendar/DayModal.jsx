import { useState } from 'react';
import { X, Pencil } from 'lucide-react';
import WorkoutDetail from '../workout/WorkoutDetail';
import WorkoutEditModal from '../workout/WorkoutEditModal';
import LogEntry from '../log/LogEntry';
import { LogFormWithDispatch } from '../log/LogForm';
import LogEntryEdit from '../log/LogEntryEdit';
import { useLog } from '../../hooks/useLog';
import { usePlan } from '../../hooks/usePlan';
import { inferType } from '../../utils/workoutTypes';
import { stravaRunsToDayDisplay, stravaActivityToLogFields } from '../../utils/stravaApi';
import { formatISO, getDateForCell } from '../../utils/dates';

function StravaRunSummary({ runs }) {
  const display = stravaRunsToDayDisplay(runs);
  if (!display) return null;

  return (
    <div className="rounded-xl border border-[#FC4C02]/30 bg-[#FC4C02]/5 p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded bg-[#FC4C02]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#FC4C02]">
          Strava
        </span>
        <span className="text-xs text-muted">{runs.length} run{runs.length > 1 ? 's' : ''}</span>
      </div>
      <p className="text-sm font-medium">{display.actualWo}</p>
      <div className="mt-1 flex gap-3 text-xs text-muted">
        <span>{display.miles} mi</span>
        <span>{display.pace}/mi</span>
      </div>
      {runs.length > 1 && (
        <ul className="mt-2 space-y-1 border-t border-[#FC4C02]/20 pt-2">
          {runs.map(run => {
            const fields = stravaActivityToLogFields(run);
            return (
              <li key={run.id} className="text-xs text-muted">
                {run.name} · {fields.miles} mi · {fields.pace}/mi
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function DayModal({ day, cell, stravaRuns = [], onClose }) {
  const { plan } = usePlan();
  const { entries, dispatch } = useLog();
  const dateStr = formatISO(day);
  const dayLogs = entries.filter(e => e.date === dateStr);
  const [showForm, setShowForm] = useState(dayLogs.length === 0);
  const [editingId, setEditingId] = useState(null);
  const [showEditPlan, setShowEditPlan] = useState(false);

  const workout = plan[cell.wi].d[cell.di];
  const type = inferType(workout);
  const isRestDay = type === 'rest' || type === 'nationals';
  const hasStravaRuns = stravaRuns.length > 0 && dayLogs.length === 0;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
        <div
          className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-border bg-white p-6 shadow-xl sm:rounded-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-2xl tracking-widest">
              {day.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </h3>
            <button onClick={onClose} className="text-muted hover:text-dark">
              <X size={20} />
            </button>
          </div>

          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <WorkoutDetail workout={workout} />
            </div>
            <button
              onClick={() => setShowEditPlan(true)}
              className="flex shrink-0 items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-surface"
            >
              <Pencil size={14} />
              Edit
            </button>
          </div>

          {hasStravaRuns && (
            <div className="mt-6">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">From Strava</p>
              <StravaRunSummary runs={stravaRuns} />
            </div>
          )}

          {dayLogs.length > 0 && (
            <div className="mt-6 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-muted">Logged</p>
              {dayLogs.map(log => (
                editingId === log.id ? (
                  <LogEntryEdit
                    key={log.id}
                    entry={log}
                    plannedWorkout={workout}
                    date={day}
                    onDone={() => setEditingId(null)}
                  />
                ) : (
                  <LogEntry
                    key={log.id}
                    entry={log}
                    onEdit={() => setEditingId(log.id)}
                    onDelete={() => dispatch({ type: 'DELETE_ENTRY', id: log.id })}
                  />
                )
              ))}
            </div>
          )}

          {!isRestDay && (showForm || dayLogs.length === 0) && (
            <div className="mt-6">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">
                Log this workout
              </p>
              <LogFormWithDispatch
                plannedWorkout={workout}
                date={day}
                wk={cell.wi + 1}
                compact
                initialValues={
                  hasStravaRuns && stravaRuns[0]
                    ? stravaActivityToLogFields(stravaRuns[0])
                    : {}
                }
                onDone={() => {
                  setShowForm(false);
                  if (dayLogs.length === 0) onClose();
                }}
              />
            </div>
          )}

          {!isRestDay && dayLogs.length > 0 && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-sm font-semibold text-accent hover:underline"
            >
              Log another
            </button>
          )}
        </div>
      </div>

      {showEditPlan && (
        <WorkoutEditModal
          wi={cell.wi}
          di={cell.di}
          workout={workout}
          onClose={() => setShowEditPlan(false)}
        />
      )}
    </>
  );
}

export { getDateForCell };
