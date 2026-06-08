import { useState } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import WorkoutCard from '../components/workout/WorkoutCard';
import { LogFormWithDispatch } from '../components/log/LogForm';
import LogEntry from '../components/log/LogEntry';
import StravaConnect, { StravaSyncButton } from '../components/strava/StravaConnect';
import { useToday } from '../hooks/useToday';
import { useLogForDate } from '../hooks/useLog';
import { inferType } from '../utils/workoutTypes';
import { stravaActivityToLogFields } from '../utils/stravaApi';
import { formatShort } from '../utils/dates';

export default function Today() {
  const todayData = useToday();
  const [showForm, setShowForm] = useState(false);
  const [stravaPrefill, setStravaPrefill] = useState(null);

  if (todayData.status === 'before') {
    return (
      <PageWrapper>
        <h1 className="font-display text-4xl tracking-widest">Today&apos;s Workout</h1>
        <p className="mt-8 text-lg text-muted">Training begins June 1.</p>
      </PageWrapper>
    );
  }

  if (todayData.status === 'after') {
    return (
      <PageWrapper>
        <h1 className="font-display text-4xl tracking-widest">Today&apos;s Workout</h1>
        <p className="mt-8 text-lg">🏁 Santa Barbara done. How&apos;d it go?</p>
      </PageWrapper>
    );
  }

  const { week, workout, date, dateStr, upcoming } = todayData;
  const dayLogs = useLogForDate(dateStr);
  const type = inferType(workout);
  const isRestDay = type === 'rest' || type === 'nationals';

  function handleStravaSync(activity) {
    setStravaPrefill(stravaActivityToLogFields(activity));
    setShowForm(true);
  }

  return (
    <PageWrapper>
      <p className="text-sm text-muted">
        {formatShort(date)} · Week {week.wk} of 14 · {week.p}
      </p>
      <h1 className="mt-1 font-display text-4xl tracking-widest">Today&apos;s Workout</h1>

      <div className="mt-6">
        <WorkoutCard
          workout={workout}
          date={date}
          isToday
          isLogged={dayLogs.length > 0}
          logCount={dayLogs.length}
          size="lg"
          tag={week.t}
        />
      </div>

      {upcoming.length > 0 && (
        <div className="mt-8">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">Upcoming</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {upcoming.map(({ workout: w, date: d }, i) => (
              <WorkoutCard key={i} workout={w} date={d} size="sm" />
            ))}
          </div>
        </div>
      )}

      {!isRestDay && (
        <div className="mt-6 flex items-center gap-4">
          <StravaSyncButton onSync={handleStravaSync} />
          <StravaConnect />
        </div>
      )}

      {!isRestDay && (
        <div className="mt-8">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">Log this workout</p>

          {dayLogs.length > 0 && !showForm && (
            <div className="space-y-3">
              {dayLogs.map(log => (
                <LogEntry key={log.id} entry={log} />
              ))}
              <button
                onClick={() => setShowForm(true)}
                className="text-sm font-semibold text-accent hover:underline"
              >
                Log another
              </button>
            </div>
          )}

          {(showForm || dayLogs.length === 0) && (
            <LogFormWithDispatch
              plannedWorkout={workout}
              date={date}
              wk={week.wk}
              initialValues={stravaPrefill ?? {}}
              onDone={() => {
                setShowForm(false);
                setStravaPrefill(null);
              }}
            />
          )}
        </div>
      )}

      {isRestDay && (
        <p className="mt-8 text-muted">Rest day — recover and come back strong.</p>
      )}
    </PageWrapper>
  );
}
