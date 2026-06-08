import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/', label: 'Today', end: true },
  { to: '/calendar', label: 'Calendar' },
  { to: '/weekly', label: 'Weekly' },
  { to: '/progress', label: 'Progress' },
  { to: '/strength', label: 'Strength' },
];

export default function Nav() {
  return (
    <nav className="sticky top-0 z-50 bg-dark">
      <div className="mx-auto flex max-w-5xl items-center gap-1 overflow-x-auto px-4">
        <span className="mr-4 shrink-0 font-display text-xl tracking-widest text-white">
          SB26
        </span>
        {tabs.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `shrink-0 border-b-2 px-4 py-3 text-sm transition-colors ${
                isActive
                  ? 'border-accent font-semibold text-accent'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
