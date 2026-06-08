import { getStravaAuthUrl } from '../../utils/stravaApi';
import { useStrava } from '../../hooks/useStrava';
import { RefreshCw } from 'lucide-react';

export default function StravaConnect() {
  const { connected } = useStrava();

  if (connected) {
    return (
      <span className="text-xs text-emerald-600 font-semibold">Strava connected</span>
    );
  }

  return (
    <a
      href={getStravaAuthUrl()}
      className="text-xs font-semibold text-muted hover:text-accent underline"
    >
      Connect Strava
    </a>
  );
}

export function StravaSyncButton({ onSync }) {
  const { connected, syncing, syncToday } = useStrava();

  if (!connected) return null;

  async function handleSync() {
    const activities = await syncToday();
    if (activities.length > 0) {
      onSync?.(activities[0]);
    }
  }

  return (
    <button
      onClick={handleSync}
      disabled={syncing}
      className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold hover:bg-surface disabled:opacity-50"
    >
      <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
      {syncing ? 'Syncing…' : 'Sync from Strava'}
    </button>
  );
}
