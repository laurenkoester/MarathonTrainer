import { WORKOUT_TYPES, inferType } from '../../utils/workoutTypes';

export default function WorkoutBadge({ workout, className = '' }) {
  const type = inferType(workout);
  const { label, fg, bg } = WORKOUT_TYPES[type];

  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${className}`}
      style={{ color: fg, backgroundColor: bg }}
    >
      {label}
    </span>
  );
}
