import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { WORKOUT_TYPES, inferType, parsePlannedDistance, parsePlannedPace } from '../../utils/workoutTypes';
import { stravaRunsToDayDisplay } from '../../utils/stravaApi';
import { formatShort, isToday as checkIsToday } from '../../utils/dates';

function resolveDayDisplay(logs, stravaRuns) {
  if (logs.length > 0) {
    return { entries: logs, fromStrava: false };
  }
  const stravaDisplay = stravaRunsToDayDisplay(stravaRuns);
  if (stravaDisplay) {
    return { entries: [stravaDisplay], fromStrava: true };
  }
  return { entries: [], fromStrava: false };
}

export function CalendarDayContent({
  date,
  workout,
  logs = [],
  stravaRuns = [],
  isToday,
  isPast,
  editMode = false,
  isSelected = false,
  isOver = false,
  isDragging = false,
}) {
  const { entries, fromStrava } = resolveDayDisplay(logs, stravaRuns);
  const isLogged = entries.length > 0;
  const primary = isLogged ? entries[entries.length - 1] : null;
  const totalMiles = entries.reduce((sum, e) => sum + (parseFloat(e.miles) || 0), 0);

  const plannedMiles = workout ? parsePlannedDistance(workout) : null;
  const plannedPace = workout ? parsePlannedPace(workout) : null;

  const displayType = isLogged
    ? inferType(primary.actualWo || primary.wo || workout || '')
    : inferType(workout || '');
  const { bar, bg, label, fg } = WORKOUT_TYPES[displayType];

  const displayMiles = isLogged && totalMiles > 0 ? totalMiles : plannedMiles;
  const displayPace = isLogged && primary?.pace
    ? `${primary.pace.replace(/\/mi$/, '')}/mi`
    : plannedPace;

  return (
    <div
      className={`relative min-h-[110px] w-full rounded-lg border p-2 text-left md:min-h-[130px] ${
        editMode ? 'border-dashed cursor-grab active:cursor-grabbing' : 'border-border'
      } ${isToday ? 'ring-2 ring-accent' : ''} ${
        isPast && !isLogged && !editMode ? 'opacity-50' : ''
      } ${isSelected ? 'ring-2 ring-accent ring-offset-1' : ''} ${
        isOver ? 'ring-2 ring-emerald-400 ring-offset-1' : ''
      } ${isDragging ? 'opacity-40' : ''} ${isLogged && !editMode ? 'ring-1 ring-emerald-400/50' : ''}`}
      style={{ backgroundColor: bg }}
    >
      <div className="absolute left-0 top-0 h-full w-1 rounded-l-lg" style={{ backgroundColor: bar }} />

      {editMode && (
        <div className="absolute bottom-1 right-1 text-muted opacity-40">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="9" cy="5" r="1.5" />
            <circle cx="15" cy="5" r="1.5" />
            <circle cx="9" cy="12" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="19" r="1.5" />
            <circle cx="15" cy="19" r="1.5" />
          </svg>
        </div>
      )}

      <div className="relative pl-2">
        <div className="flex items-start justify-between gap-1">
          <span className="text-xs font-bold">{formatShort(date)}</span>
          <div className="flex items-center gap-1">
            {fromStrava && (
              <span className="rounded bg-[#FC4C02]/15 px-1 py-0.5 text-[8px] font-bold uppercase tracking-wide text-[#FC4C02]">
                Strava
              </span>
            )}
            {isLogged && (
              <span className="relative flex h-2 w-2 shrink-0 rounded-full bg-emerald-500">
                {entries.length > 1 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-bold text-white">
                    {entries.length}
                  </span>
                )}
              </span>
            )}
          </div>
        </div>

        <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
          {label}
        </p>

        {displayMiles != null && displayMiles > 0 && (
          <p className="mt-0.5 text-xs font-bold" style={{ color: fg }}>
            {displayMiles % 1 === 0 ? displayMiles : Number(displayMiles).toFixed(1)} mi
            {isLogged && entries.length > 1 && (
              <span className="ml-1 text-[10px] font-normal text-muted">({entries.length} runs)</span>
            )}
          </p>
        )}

        {displayPace && (
          <p className={`text-[10px] ${isLogged ? 'font-medium text-emerald-700' : 'text-muted'}`}>
            {displayPace}
          </p>
        )}

        {isLogged && !editMode && plannedMiles != null && totalMiles !== plannedMiles && (
          <p className="mt-0.5 text-[10px] text-muted line-through">
            planned {plannedMiles % 1 === 0 ? plannedMiles : plannedMiles.toFixed(1)} mi
            {plannedPace ? ` · ${plannedPace}` : ''}
          </p>
        )}
      </div>
    </div>
  );
}

export default function CalendarDay({
  date,
  workout,
  logs = [],
  stravaRuns = [],
  inPlan,
  editMode = false,
  dragId = null,
  isSelected = false,
  onClick,
}) {
  const isToday = checkIsToday(date);
  const isPast = date < new Date(new Date().setHours(0, 0, 0, 0)) && !isToday;

  const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } = useDraggable({
    id: dragId ?? 'disabled',
    disabled: !editMode || !dragId,
  });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: dragId ?? 'disabled',
    disabled: !editMode || !dragId,
  });

  function setNodeRef(node) {
    setDragRef(node);
    setDropRef(node);
  }

  if (!inPlan) {
    return <div className="min-h-[110px] rounded-lg bg-surface/50 md:min-h-[130px]" />;
  }

  const style = editMode && transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  const content = (
    <CalendarDayContent
      date={date}
      workout={workout}
      logs={logs}
      stravaRuns={stravaRuns}
      isToday={isToday}
      isPast={isPast}
      editMode={editMode}
      isSelected={isSelected}
      isOver={isOver}
      isDragging={isDragging}
    />
  );

  if (editMode) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        onClick={onClick}
        {...listeners}
        {...attributes}
      >
        {content}
      </div>
    );
  }

  return (
    <button type="button" onClick={onClick} className="w-full">
      {content}
    </button>
  );
}

export function CalendarDayOverlay({ date, workout, logs = [], stravaRuns = [] }) {
  return (
    <div className="w-full min-w-[100px] shadow-lg">
      <CalendarDayContent
        date={date}
        workout={workout}
        logs={logs}
        stravaRuns={stravaRuns}
        isToday={checkIsToday(date)}
        isPast={false}
        editMode
      />
    </div>
  );
}
