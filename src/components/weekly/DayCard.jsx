import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { WORKOUT_TYPES, inferType } from '../../utils/workoutTypes';
import { DAY_NAMES, formatShort, isToday as checkIsToday } from '../../utils/dates';
import { useLongPress } from '../../hooks/useLongPress';
import { resolveDayDisplay } from '../../utils/activityMiles';
import { getBucket } from '../../utils/progressData';
import WorkoutEditModal from '../workout/WorkoutEditModal';

export default function DayCard({ id, wi, di, workout, date, logs = [], stravaRuns = [], isSelected, onClick }) {
  const [editOpen, setEditOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const { entries: activityEntries, fromStrava } = resolveDayDisplay(logs, stravaRuns);
  const hasActivity = activityEntries.length > 0;

  // Use actual activity data when available, otherwise fall back to the plan
  const activity = hasActivity ? activityEntries[activityEntries.length - 1] : null;
  const displayMilesRaw = activity ? parseFloat(activity.miles) || null : null;

  function resolveDisplayText() {
    if (!activity) return workout.split('|')[0].trim();
    // For Strava runs, use the distance bucket label ("Short Run" / "Medium Run" / "Long Run")
    // instead of the personal Strava activity name, which is rarely meaningful here.
    if (fromStrava && displayMilesRaw != null) {
      const bucket = getBucket(displayMilesRaw);
      if (bucket) return `${bucket.label} Run`;
    }
    // For manual logs, use whatever the user typed as actualWo
    return activity.actualWo || workout.split('|')[0].trim();
  }

  const displayText = resolveDisplayText();
  const displayMiles = displayMilesRaw;
  const displayPace = activity ? activity.pace || null : null;

  // Color is always based on the planned workout type
  const type = inferType(workout);
  const { bar, bg, fg } = WORKOUT_TYPES[type];
  const isToday = checkIsToday(date);

  const longPress = useLongPress(() => setEditOpen(true));

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: bg,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`relative w-full cursor-grab rounded-xl border shadow-sm active:cursor-grabbing md:w-[140px] md:shrink-0 ${
          hasActivity ? 'border-emerald-300' : 'border-border'
        } ${isSelected ? 'ring-2 ring-accent' : ''} ${isToday ? 'ring-1 ring-accent/50' : ''}`}
        onClick={(e) => {
          longPress.onClick(e);
          if (!e.defaultPrevented) onClick?.();
        }}
        onContextMenu={longPress.onContextMenu}
        onTouchStart={longPress.onTouchStart}
        onTouchEnd={longPress.onTouchEnd}
        onTouchMove={longPress.onTouchMove}
        {...attributes}
        {...listeners}
      >
        <div className="h-[3px] w-full rounded-t-xl" style={{ backgroundColor: bar }} />

        <div className="p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold">{DAY_NAMES[di]}</span>
            <span className="text-muted">{formatShort(date)}</span>
          </div>

          <div className="mt-1 flex items-center gap-1">
            <span className="h-[5px] w-[5px] rounded-full" style={{ backgroundColor: bar }} />
            <span className="text-[10px] font-semibold uppercase" style={{ color: fg }}>
              {WORKOUT_TYPES[type].label}
            </span>
            {fromStrava && (
              <span className="text-[9px] font-bold uppercase text-[#FC4C02]">· Strava</span>
            )}
          </div>

          {hasActivity ? (
            <>
              {displayMiles != null && (
                <p className="mt-1 text-sm font-bold text-emerald-700">
                  {Number(displayMiles).toFixed(1)} mi
                  {displayPace && (
                    <span className="ml-1 text-[10px] font-normal text-muted">{displayPace}/mi</span>
                  )}
                </p>
              )}
              <p className="mt-0.5 text-[10px] leading-snug line-clamp-2 text-muted">
                {displayText}
              </p>
            </>
          ) : (
            <p className="mt-1 text-xs leading-snug line-clamp-3" style={{ color: fg }}>
              {displayText}
            </p>
          )}

          {isToday && (
            <span className="absolute bottom-2 right-2 text-[10px] font-bold uppercase text-accent">today</span>
          )}

          {hasActivity && (
            <span className="absolute right-2 top-2">
              {activityEntries.length > 1 ? (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white">
                  {activityEntries.length}
                </span>
              ) : (
                <span className="block h-2.5 w-2.5 rounded-full bg-emerald-500" />
              )}
            </span>
          )}
        </div>
      </div>

      {editOpen && (
        <WorkoutEditModal
          wi={wi}
          di={di}
          workout={workout}
          date={date}
          onClose={() => setEditOpen(false)}
        />
      )}
    </>
  );
}

export function DayCardOverlay({ workout, date, di }) {
  const type = inferType(workout);
  const { bar, bg, fg } = WORKOUT_TYPES[type];
  const [runPart] = workout.split('|').map(s => s.trim());

  return (
    <div className="w-full rounded-xl border border-border shadow-lg md:w-[140px]" style={{ backgroundColor: bg }}>
      <div className="h-[3px] w-full rounded-t-xl" style={{ backgroundColor: bar }} />
      <div className="p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold">{DAY_NAMES[di]}</span>
          <span className="text-muted">{formatShort(date)}</span>
        </div>
        <p className="mt-2 text-xs leading-snug line-clamp-3" style={{ color: fg }}>{runPart}</p>
      </div>
    </div>
  );
}
