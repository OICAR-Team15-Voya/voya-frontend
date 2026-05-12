import { useEffect, useState, useCallback } from 'react';
import { userService } from '../services/userService';
import { Button } from '../components/ui/Button';
import type { User } from '../types';

function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (err) {
      setError('Greška pri dohvaćanju korisnika.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function handleDeactivate(id: number) {
    try {
      await userService.deactivate(id);
      await fetchUsers();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleActivate(id: number) {
    try {
      await userService.activate(id);
      await fetchUsers();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Sigurno hoćeš obrisati korisnika?')) return;
    try {
      await userService.delete(id);
      await fetchUsers();
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <PageMessage>Učitavanje...</PageMessage>;
  if (error) return <PageMessage tone="error">{error}</PageMessage>;

  return (
    <div className="p-8">
      <div className="text-[10px] tracking-[0.3em] text-[var(--color-ink-muted)] mb-2 uppercase">
        Administracija
      </div>
      <div className="flex items-baseline justify-between mb-8">
        <h1
          className="text-4xl font-light"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Korisnici
        </h1>
        <div className="text-sm text-[var(--color-ink-muted)]">
          Ukupno: <span className="text-[var(--color-ink)]">{users.length}</span>
        </div>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-rule)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-rule)] text-left">
              <Th>ID</Th>
              <Th>Email</Th>
              <Th>Ime i prezime</Th>
              <Th>Telefon</Th>
              <Th>Uloga</Th>
              <Th>Status</Th>
              <Th className="text-right">Akcije</Th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-[var(--color-rule)] last:border-b-0 hover:bg-[var(--color-surface-elevated)] transition-colors"
              >
                <Td className="text-[var(--color-ink-muted)]">{user.id}</Td>
                <Td>{user.email}</Td>
                <Td>{user.firstName} {user.lastName || ''}</Td>
                <Td className="text-[var(--color-ink-soft)]">{user.phone || '—'}</Td>
                <Td>
                  <RoleBadge role={user.role} />
                </Td>
                <Td>
                  <StatusBadge active={user.status} />
                </Td>
                <Td className="text-right">
                  <div className="inline-flex gap-2">
                    {user.status ? (
                      <Button
                        variant="ghost"
                        onClick={() => handleDeactivate(user.id)}
                        className="!py-1 !px-3 text-xs"
                      >
                        Deaktiviraj
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => handleActivate(user.id)}
                        className="!py-1 !px-3 text-xs"
                      >
                        Aktiviraj
                      </Button>
                    )}
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(user.id)}
                      className="!py-1 !px-3 text-xs"
                    >
                      Obriši
                    </Button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* lokalne pomoćne komponente  */

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={`px-4 py-3 text-[10px] tracking-[0.2em] text-[var(--color-ink-muted)] uppercase font-normal ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    ADMIN: 'text-[var(--color-gold)] border-[var(--color-gold)]/40',
    DRIVER: 'text-[var(--color-ink)] border-[var(--color-rule-strong)]',
    CLIENT: 'text-[var(--color-ink-soft)] border-[var(--color-rule)]',
  };
  return (
    <span
      className={`inline-block px-2 py-0.5 text-[10px] tracking-[0.15em] border ${
        styles[role] || styles.CLIENT
      }`}
    >
      {role}
    </span>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs ${
        active ? 'text-[var(--color-success)]' : 'text-[var(--color-ink-muted)]'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          active ? 'bg-[var(--color-success)]' : 'bg-[var(--color-ink-muted)]'
        }`}
      />
      {active ? 'Aktivan' : 'Neaktivan'}
    </span>
  );
}

function PageMessage({
  children,
  tone = 'default',
}: {
  children: React.ReactNode;
  tone?: 'default' | 'error';
}) {
  return (
    <div
      className={`p-8 text-sm ${
        tone === 'error' ? 'text-[var(--color-danger)]' : 'text-[var(--color-ink-soft)]'
      }`}
    >
      {children}
    </div>
  );
}

export default UsersPage;