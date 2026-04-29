import { NavLink } from 'react-router-dom';

interface NavItem {
  to: string;
  label: string;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Pregled' },
  { to: '/users', label: 'Korisnici', adminOnly: true },
  { to: '/drivers', label: 'Vozači', adminOnly: true },
  { to: '/profile', label: 'Profil' },
];

export function Sidebar() {
  const userJson = localStorage.getItem('currentUser');
  const currentUser = userJson ? JSON.parse(userJson) : null;
  const isAdmin = currentUser?.role === 'ADMIN';

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.adminOnly || isAdmin,
  );

  return (
    <aside className="w-56 bg-[var(--color-surface)] border-r border-[var(--color-rule)] flex flex-col">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-[var(--color-rule)]">
        <div
          className="text-xl tracking-[0.3em] font-light"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          VOYA
        </div>
        <div className="text-[9px] tracking-[0.2em] text-[var(--color-ink-muted)] mt-1 uppercase">
          Dispatch
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `px-3 py-2 text-sm rounded-sm transition-colors ${
                isActive
                  ? 'bg-[var(--color-gold-faint)] text-[var(--color-gold)]'
                  : 'text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-ink)]'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}