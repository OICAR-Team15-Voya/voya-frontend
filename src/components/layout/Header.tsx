import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';

export function Header() {
  const navigate = useNavigate();
  const userJson = localStorage.getItem('currentUser');
  const currentUser = userJson ? JSON.parse(userJson) : null;

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    navigate('/login');
  }

  return (
    <header className="h-14 border-b border-[var(--color-rule)] px-6 flex items-center justify-between bg-[var(--color-canvas)]">
      <div className="text-xs text-[var(--color-ink-muted)]">
        {new Date().toLocaleDateString('hr-HR', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })}
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right leading-tight">
          <div className="text-sm">
            {currentUser?.firstName} {currentUser?.lastName}
          </div>
          <div className="text-[10px] tracking-[0.15em] text-[var(--color-gold)] uppercase">
            {currentUser?.role}
          </div>
        </div>

        <Button variant="ghost" onClick={handleLogout}>
          Odjava
        </Button>
      </div>
    </header>
  );
}