import { useState } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import WorkoutCard from '../components/workout/WorkoutCard';
import WorkoutBadge from '../components/workout/WorkoutBadge';
import { LogFormWithDispatch } from '../components/log/LogForm';
import LogEntry from '../components/log/LogEntry';
import StravaConnect, { StravaSyncButton } from '../components/strava/StravaConnect';
import WeekScroller from '../components/home/WeekScroller';
import MileageChart from '../components/progress/MileageChart';
import { useToday } from '../hooks/useToday';
import { useLogForDate, useLog } from '../hooks/useLog';
import { useStravaAllRuns } from '../hooks/useStravaAllRuns';
import { inferType, parsePlannedDistance, parsePlannedPace, WORKOUT_TYPES } from '../utils/workoutTypes';
import { stravaActivityToLogFields, stravaRunsToDayDisplay } from '../utils/stravaApi';
import { computeSeasonTotals } from '../utils/activityMiles';
import { formatShort } from '../utils/dates';

// Strava is the primary source; manual logs are fallback only when no Strava data exists.
function LoggedHero({ workout, dayLogs, stravaDisplay }) {
  const fromStrava = stravaDisplay != null;
  const type = inferType(workout);
  const { bar, bg, fg } = WORKOUT_TYPES[type];

  const totalMiles = fromStrava
    ? parseFloat(stravaDisplay.miles) || 0
    : dayLogs.reduce((sum, e) => sum + (parseFloat(e.miles) || 0), 0);
  const pace = fromStrava ? stravaDisplay.pace : dayLogs[dayLogs.length - 1]?.pace;

  const plannedMiles = parsePlannedDistance(workout);
  const plannedPace = parsePlannedPace(workout);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border shadow-sm" style={{ backgroundColor: bg }}>
      <div className="absolute left-0 top-0 h-1.5 w-full" style={{ backgroundColor: bar }} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <WorkoutBadge workout={workout} />
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            {fromStrava ? 'Via Strava ✓' : 'Logged ✓'}
          </span>
        </div>
        <p className="mt-3 font-display text-5xl tracking-wide" style={{ color: fg }}>
          {totalMiles.toFixed(1)} mi
        </p>
        <div className="mt-1 space-y-0.5 text-sm text-muted">
          {plannedMiles != null && (
            <p>
              planned: {plannedMiles % 1 === 0 ? plannedMiles : plannedMiles.toFixed(1)} mi
              {plannedPace ? ` · ${plannedPace}` : ''}
            </p>
          )}
          {pace && (
            <p className="font-medium" style={{ color: fg }}>{pace}/mi avg pace</p>
          )}
        </div>
        {!fromStrava && dayLogs.length > 1 && (
          <p className="mt-1 text-xs text-muted">{dayLogs.length} runs logged today</p>
        )}
      </div>
    </div>
  );
}

function SummaryStats({ entries, runsByDate }) {
  const { totalMiles, workoutCount } = computeSeasonTotals(entries, runsByDate);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl border border-border bg-white p-4 text-center shadow-sm">
        <p className="font-display text-3xl tracking-wide">{totalMiles.toFixed(1)}</p>
        <p className="mt-0.5 text-xs font-bold uppercase tracking-widest text-muted">Miles logged</p>
      </div>
      <div className="rounded-xl border border-border bg-white p-4 text-center shadow-sm">
        <p className="font-display text-3xl tracking-wide">{workoutCount}</p>
        <p className="mt-0.5 text-xs font-bold uppercase tracking-widest text-muted">Workouts</p>
      </div>
    </div>
  );
}

export default function Today() {
  const todayData = useToday();
  const [showForm, setShowForm] = useState(false);
  const [stravaPrefill, setStravaPrefill] = useState(null);
  const { entries } = useLog();
  const { runsByDate, loading: stravaLoading } = useStravaAllRuns();

  if (todayData.status === 'before') {
    return (
      <PageWrapper>
        <h1 className="font-display text-3xl tracking-widest sm:text-4xl">Today&apos;s Workout</h1>
        <p className="mt-8 text-lg text-muted">Training begins June 1.</p>
      </PageWrapper>
    );
  }

  if (todayData.status === 'after') {
    return (
      <PageWrapper>
        <h1 className="font-display text-3xl tracking-widest sm:text-4xl">Today&apos;s Workout</h1>
        <p className="mt-8 text-lg">🏁 Santa Barbara done. How&apos;d it go?</p>
      </PageWrapper>
    );
  }

  const { week, workout, date, dateStr, upcoming } = todayData;
  const dayLogs = useLogForDate(dateStr);
  const type = inferType(workout);
  const isRestDay = type === 'rest' || type === 'nationals';
  const todayStravaDisplay = stravaRunsToDayDisplay(runsByDate[dateStr]);
  const isLogged = dayLogs.length > 0 || todayStravaDisplay != null;

  function handleStravaSync(activity) {
    setStravaPrefill(stravaActivityToLogFields(activity));
    setShowForm(true);
  }

  return (
    <PageWrapper>
      <p className="text-sm text-muted">
        {formatShort(date)} · Week {week.wk} of 14 · {week.p}
      </p>
      <h1 className="mt-0.5 font-display text-3xl tracking-widest sm:text-4xl">
        Today&apos;s Workout
      </h1>

      <div className="mt-4">
        {isLogged ? (
          <LoggedHero workout={workout} dayLogs={dayLogs} stravaDisplay={todayStravaDisplay} />
        ) : (
          <WorkoutCard
            workout={workout}
            date={date}
            isToday
            isLogged={isLogged}
            logCount={dayLogs.length}
            size="lg"
            tag={week.t}
          />
        )}
      </div>

      {!isRestDay && (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <StravaSyncButton onSync={handleStravaSync} />
            <StravaConnect />
          </div>

          <div className="mt-6">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">
              {isLogged ? 'Log another' : 'Log this workout'}
            </p>
            {isLogged && !showForm ? (
              <div className="space-y-3">
                {dayLogs.map(log => (
                  <LogEntry key={log.id} entry={log} />
                ))}
                <button
                  onClick={() => setShowForm(true)}
                  className="text-sm font-semibold text-accent hover:underline"
                >
                  + Log another
                </button>
              </div>
            ) : (
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
        </>
      )}

      {isRestDay && (
        <p className="mt-6 text-muted">Rest day — recover and come back strong.</p>
      )}

      {upcoming.length > 0 && (
        <div className="mt-10">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">Upcoming</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {upcoming.map(({ workout: w, date: d }, i) => (
              <WorkoutCard key={i} workout={w} date={d} size="sm" />
            ))}
          </div>
        </div>
      )}

      <div className="mt-10">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">Week Overview</p>
        <WeekScroller runsByDate={runsByDate} />
      </div>

      <div className="mt-10">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">14-Week Mileage</p>
        {stravaLoading && (
          <p className="mb-2 text-xs text-muted">Syncing Strava runs…</p>
        )}
        <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <MileageChart runsByDate={runsByDate} />
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">Season Stats</p>
        <SummaryStats entries={entries} runsByDate={runsByDate} />
      </div>
    </PageWrapper>
  );
}
