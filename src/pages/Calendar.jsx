import { useState } from 'react';
import { ChevronLeft, ChevronRight, Pencil, Check, RefreshCw } from 'lucide-react';
import { addMonths, subMonths, format } from 'date-fns';
import PageWrapper from '../components/layout/PageWrapper';
import MonthGrid from '../components/calendar/MonthGrid';
import DayModal from '../components/calendar/DayModal';
import StravaConnect from '../components/strava/StravaConnect';
import { useLog } from '../hooks/useLog';
import { useStrava } from '../hooks/useStrava';
import { useStravaMonth } from '../hooks/useStravaMonth';
import { PLAN_START, formatISO } from '../utils/dates';

export default function Calendar() {
  const { entries } = useLog();
  const { connected } = useStrava();
  const [month, setMonth] = useState(PLAN_START);
  const [modal, setModal] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { runsByDate, loading: stravaLoading } = useStravaMonth(month, refreshKey);

  function handleToggleEdit() {
    setEditMode(e => !e);
    setModal(null);
  }

  function handleRefreshStrava() {
    setRefreshKey(k => k + 1);
  }

  return (
    <PageWrapper>
      <div className="flex items-start justify-between gap-4">
        <h1 className="font-display text-4xl tracking-widest">Calendar</h1>
        <button
          onClick={handleToggleEdit}
          className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            editMode
              ? 'bg-accent text-white hover:bg-orange-600'
              : 'border border-border bg-white hover:bg-surface'
          }`}
        >
          {editMode ? <Check size={16} /> : <Pencil size={16} />}
          {editMode ? 'Done' : 'Edit Plan'}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <StravaConnect />
        {connected && (
          <button
            onClick={handleRefreshStrava}
            disabled={stravaLoading}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-dark disabled:opacity-50"
          >
            <RefreshCw size={14} className={stravaLoading ? 'animate-spin' : ''} />
            {stravaLoading ? 'Syncing runs…' : 'Refresh Strava runs'}
          </button>
        )}
      </div>

      {editMode && (
        <p className="mt-3 rounded-lg border border-accent/30 bg-accent/5 px-4 py-2 text-sm text-muted">
          Drag a workout onto another day to swap, or tap one day then another.
        </p>
      )}

      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => setMonth(m => subMonths(m, 1))}
          className="rounded-lg border border-border p-2 hover:bg-white"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="font-display text-2xl tracking-widest">
          {format(month, 'MMMM yyyy')}
        </h2>
        <button
          onClick={() => setMonth(m => addMonths(m, 1))}
          className="rounded-lg border border-border p-2 hover:bg-white"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="mt-6">
        <MonthGrid
          month={month}
          logs={entries}
          stravaRunsByDate={runsByDate}
          editMode={editMode}
          onDayClick={(day, cell) => setModal({ day, cell })}
        />
      </div>

      {modal && !editMode && (
        <DayModal
          day={modal.day}
          cell={modal.cell}
          stravaRuns={runsByDate[formatISO(modal.day)] ?? []}
          onClose={() => setModal(null)}
        />
      )}
    </PageWrapper>
  );
}
