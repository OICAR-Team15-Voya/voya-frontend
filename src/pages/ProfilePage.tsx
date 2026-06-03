import { useEffect, useState, useCallback } from 'react';
import { userService } from '../services/userService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import type { User } from '../types';



function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdSubmitting, setPwdSubmitting] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  
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

  async function handlePasswordChange(event: React.FormEvent) {
    event.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (newPassword !== confirmPassword) {
      setPwdError('Nove lozinke se ne podudaraju.');
      return;
    }
    if (newPassword.length < 6) {
      setPwdError('Lozinka mora imati barem 6 znakova.');
      return;
    }
    if (!user) return;

    setPwdSubmitting(true);
    try {
      await userService.updatePassword(user.id, { oldPassword, newPassword });
      setPwdSuccess('Lozinka je promijenjena.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwdError('Greška pri promjeni lozinke. Provjeri staru lozinku.');
      console.error(err);
    } finally {
      setPwdSubmitting(false);
    }
  }

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

      {/* Promjena lozinke - samo za ADMIN po specki*/}
        {user.role === 'ADMIN' && (
        <div className="max-w-2xl mt-10">
          <div className="text-[10px] tracking-[0.3em] text-[var(--color-ink-muted)] mb-3 uppercase">
            Sigurnost
          </div>
          <h2
          className="text-2xl font-light mb-6"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Promjena lozinke
        </h2>

        <form onSubmit={handlePasswordChange} className="space-y-6">
          <Input
            name="oldPassword"
            type="password"
            label="Trenutna lozinka"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
          <Input
            name="newPassword"
            type="password"
            label="Nova lozinka"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
          />
          <Input
            name="confirmPassword"
            type="password"
            label="Potvrdi novu lozinku"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
          />

          {pwdError && (
            <div className="text-xs text-[var(--color-danger)] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-3 py-2 rounded-sm">
              {pwdError}
            </div>
          )}
          {pwdSuccess && (
            <div className="text-xs text-[var(--color-success)] border border-[var(--color-success)]/30 bg-[var(--color-success)]/10 px-3 py-2 rounded-sm">
              {pwdSuccess}
            </div>
          )}

          <Button type="submit" disabled={pwdSubmitting}>
            {pwdSubmitting ? 'Sprema...' : 'Promijeni lozinku'}
          </Button>
        </form>
      </div>)}
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