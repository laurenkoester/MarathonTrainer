import { NavLink, useLocation } from 'react-router-dom';
import { Home, Calendar, LayoutList, Dumbbell, TrendingUp, CloudOff, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const tabs = [
  { to: '/', label: 'Today', icon: Home, end: true },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/weekly', label: 'Weekly', icon: LayoutList },
  { to: '/strength', label: 'Strength', icon: Dumbbell },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
];

const PAGE_TITLES = {
  '/': 'Today',
  '/calendar': 'Calendar',
  '/weekly': 'Weekly',
  '/strength': 'Strength',
  '/progress': 'Progress',
  '/strava/callback': 'Connecting Strava…',
};

function SyncButton() {
  const { user, signIn, signOut } = useAuth();

  // Still loading auth state
  if (user === undefined) return null;

  if (!user) {
    return (
      <button
        onClick={signIn}
        className="flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400 transition-colors hover:border-accent hover:text-accent"
        title="Sign in to sync across devices"
      >
        <CloudOff size={13} />
        Sync
      </button>
    );
  }

  return (
    <button
      onClick={signOut}
      className="flex items-center gap-1.5 rounded-full border border-emerald-500/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-400 transition-colors hover:border-red-400 hover:text-red-400"
      title={`Syncing as ${user.email} — tap to sign out`}
    >
      {user.photoURL ? (
        <img src={user.photoURL} alt="" className="h-4 w-4 rounded-full" />
      ) : (
        <User size={13} />
      )}
      Synced
    </button>
  );
}

export default function Nav() {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] ?? 'SB26';

  return (
    <>
      {/* Top header */}
      <header className="sticky top-0 z-50 flex items-center justify-between bg-dark px-4 py-3 md:px-6">
        <span className="font-display text-xl tracking-widest text-white">SB26</span>
        <span className="font-display text-lg tracking-widest text-accent md:hidden">{title}</span>
        <SyncButton />
      </header>

      {/* Bottom tab bar — mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-dark md:hidden">
        <div className="flex">
          {tabs.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-0.5 py-2 text-[9px] font-semibold uppercase tracking-wider transition-colors ${
                  isActive ? 'text-accent' : 'text-gray-500'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Desktop top nav */}
      <nav className="sticky top-[52px] z-40 hidden bg-dark md:block">
        <div className="mx-auto flex max-w-5xl items-center gap-1 px-4">
          {tabs.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `shrink-0 border-b-2 px-4 py-3 text-sm transition-colors ${
                  isActive
                    ? 'border-accent font-semibold text-accent'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
