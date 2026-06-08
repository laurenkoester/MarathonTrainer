export const CORE_PHASES = [
  {
    name: 'Foundation',
    weeks: '1–8',
    description: 'Build rib flare correction and deep core stability. Focus on breathing patterns and anti-extension work.',
    exercises: ['90/90 breathing', 'dead bugs 3×10→12', 'hollow hold 3×20s→30s', 'Pallof press 3×10ea'],
  },
  {
    name: 'Progressive',
    weeks: '9–11',
    description: 'Increase core challenge with dynamic and loaded movements while maintaining form.',
    exercises: ["ab wheel 3×6→8", "farmer's carry 3×30s", 'hollow hold 3×35s', 'RDLs', 'Bulgarians'],
  },
  {
    name: 'Maintenance',
    weeks: '12–14',
    description: 'Light volume to maintain activation without fatigue before race day.',
    exercises: ['dead bugs 2×10', 'hollow hold 2×20s', 'light RDLs 2×8'],
  },
];

export function getCorePhaseForWeek(wk) {
  if (wk <= 8) return CORE_PHASES[0];
  if (wk <= 11) return CORE_PHASES[1];
  return CORE_PHASES[2];
}
