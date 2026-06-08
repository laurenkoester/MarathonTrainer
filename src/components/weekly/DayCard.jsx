import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { WORKOUT_TYPES, inferType } from '../../utils/workoutTypes';
import { DAY_NAMES, formatShort, isToday as checkIsToday } from '../../utils/dates';

export default function DayCard({ id, wi, di, workout, date, logs = [], isSelected, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const type = inferType(workout);
  const { bar, bg, fg } = WORKOUT_TYPES[type];
  const [runPart] = workout.split('|').map(s => s.trim());
  const isToday = checkIsToday(date);
  const isLogged = logs.length > 0;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: bg,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative w-[140px] shrink-0 cursor-grab rounded-xl border border-border shadow-sm active:cursor-grabbing ${
        isSelected ? 'ring-2 ring-accent' : ''
      } ${isToday ? 'ring-1 ring-accent/50' : ''}`}
      onClick={onClick}
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
        </div>

        <p className="mt-1 text-[10.5px] leading-snug line-clamp-3" style={{ color: fg }}>
          {runPart}
        </p>

        {isToday && (
          <span className="absolute bottom-2 right-2 text-[10px] font-bold uppercase text-accent">today</span>
        )}

        {isLogged && (
          <span className="absolute right-2 top-2">
            {logs.length > 1 ? (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white">
                {logs.length}
              </span>
            ) : (
              <span className="block h-2.5 w-2.5 rounded-full bg-emerald-500" />
            )}
          </span>
        )}
      </div>
    </div>
  );
}

export function DayCardOverlay({ workout, date, di }) {
  const type = inferType(workout);
  const { bar, bg, fg } = WORKOUT_TYPES[type];
  const [runPart] = workout.split('|').map(s => s.trim());

  return (
    <div className="w-[140px] rounded-xl border border-border shadow-lg" style={{ backgroundColor: bg }}>
      <div className="h-[3px] w-full rounded-t-xl" style={{ backgroundColor: bar }} />
      <div className="p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold">{DAY_NAMES[di]}</span>
          <span className="text-muted">{formatShort(date)}</span>
        </div>
        <p className="mt-2 text-[10.5px] leading-snug line-clamp-3" style={{ color: fg }}>{runPart}</p>
      </div>
    </div>
  );
}
