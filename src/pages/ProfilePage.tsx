import { useEffect, useState, useCallback } from 'react';
import { userService } from '../services/userService';
import type { User } from '../types';

function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUser = useCallback(async () => {
    try {
      const userJson = localStorage.getItem('currentUser');
      if (!userJson) {
        setError('Nema podataka o korisniku.');
        setLoading(false);
        return;
      }
      const currentUser = JSON.parse(userJson);
      const data = await userService.getById(currentUser.userId);
      setUser(data);
    } catch (err) {
      setError('Greška pri dohvaćanju profila.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (loading) {
    return <div className="p-8 text-sm text-[var(--color-ink-soft)]">Učitavanje...</div>;
  }
  if (error) {
    return <div className="p-8 text-sm text-[var(--color-danger)]">{error}</div>;
  }
  if (!user) return null;

  return (
    <div className="p-8">
      <div className="text-[10px] tracking-[0.3em] text-[var(--color-ink-muted)] mb-2 uppercase">
        Račun
      </div>
      <h1
        className="text-4xl font-light mb-10"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Moj profil
      </h1>

      <div className="max-w-2xl bg-[var(--color-surface)] border border-[var(--color-rule)]">
        <DataRow label="Ime">{user.firstName}</DataRow>
        <DataRow label="Prezime">{user.lastName || '—'}</DataRow>
        <DataRow label="Email">{user.email}</DataRow>
        <DataRow label="Telefon">{user.phone || '—'}</DataRow>
        <DataRow label="Uloga">
          <span className="inline-block px-2 py-0.5 text-[10px] tracking-[0.15em] border text-[var(--color-gold)] border-[var(--color-gold)]/40">
            {user.role}
          </span>
        </DataRow>
        <DataRow label="Status" last>
          <span className="inline-flex items-center gap-1.5 text-sm">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                user.status ? 'bg-[var(--color-success)]' : 'bg-[var(--color-ink-muted)]'
              }`}
            />
            <span className={user.status ? 'text-[var(--color-success)]' : 'text-[var(--color-ink-muted)]'}>
              {user.status ? 'Aktivan' : 'Neaktivan'}
            </span>
          </span>
        </DataRow>
      </div>
    </div>
  );
}

/* lokalna pomocna komponenta */

function DataRow({
  label,
  children,
  last = false,
}: {
  label: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center px-6 py-4 ${
        last ? '' : 'border-b border-[var(--color-rule)]'
      }`}
    >
      <div className="w-32 text-[10px] tracking-[0.2em] text-[var(--color-ink-muted)] uppercase">
        {label}
      </div>
      <div className="flex-1 text-sm text-[var(--color-ink)]">{children}</div>
    </div>
  );
}

export default ProfilePage;