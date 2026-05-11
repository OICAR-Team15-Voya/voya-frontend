import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { driverService } from '../services/driverService';
import { Button } from '../components/ui/Button';
import type { Driver } from '../types';

function DriversPage() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDrivers = useCallback(async () => {
    try {
      const data = await driverService.getAll();
      setDrivers(data);
    } catch (err) {
      setError('Greška pri dohvaćanju vozača.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  async function handleDelete(id: number) {
    if (!window.confirm('Sigurno hoćeš obrisati vozača?')) return;
    try {
      await driverService.delete(id);
      await fetchDrivers();
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
        <div>
          <h1
            className="text-4xl font-light"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Vozači
          </h1>
          <div className="text-sm text-[var(--color-ink-muted)] mt-1">
            Ukupno: <span className="text-[var(--color-ink)]">{drivers.length}</span>
          </div>
        </div>
        <Button onClick={() => navigate('/drivers/new')}>+ Novi vozač</Button>
      </div>

      {drivers.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="bg-[var(--color-surface)] border border-[var(--color-rule)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-rule)] text-left">
                <Th>ID</Th>
                <Th>Ime i prezime</Th>
                <Th>Email</Th>
                <Th>Telefon</Th>
                <Th>Vozačka vrijedi</Th>
                <Th className="text-right">Akcije</Th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver) => (
                <tr
                  key={driver.id}
                  className="border-b border-[var(--color-rule)] last:border-b-0 hover:bg-[var(--color-surface-elevated)] transition-colors"
                >
                  <Td className="text-[var(--color-ink-muted)]">{driver.id}</Td>
                  <Td>{driver.firstName} {driver.lastName}</Td>
                  <Td className="text-[var(--color-ink-soft)]">{driver.email}</Td>
                  <Td className="text-[var(--color-ink-soft)]">{driver.phone}</Td>
                  <Td>
                    <LicenseExpiry date={driver.licenseValidUntil} />
                  </Td>
                  <Td className="text-right">
                    <div className="inline-flex gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => navigate(`/drivers/${driver.id}/edit`)}
                        className="!py-1 !px-3 text-xs"
                      >
                        Uredi
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(driver.id)}
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
      )}
    </div>
  );
}

/* ---------- Lokalne pomoćne komponente ---------- */

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

function LicenseExpiry({ date }: { date: string }) {
  const expiryDate = new Date(date);
  const now = new Date();
  const monthsUntilExpiry =
    (expiryDate.getFullYear() - now.getFullYear()) * 12 +
    (expiryDate.getMonth() - now.getMonth());

  const isExpired = expiryDate < now;
  const expiresSoon = !isExpired && monthsUntilExpiry < 6;

  let toneClass = 'text-[var(--color-ink)]';
  if (isExpired) toneClass = 'text-[var(--color-danger)]';
  else if (expiresSoon) toneClass = 'text-[var(--color-warning)]';

  return (
    <span className={toneClass}>
      {expiryDate.toLocaleDateString('hr-HR')}
      {isExpired && <span className="ml-2 text-[10px] uppercase tracking-wider">istekla</span>}
      {expiresSoon && <span className="ml-2 text-[10px] uppercase tracking-wider">uskoro</span>}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-rule)] p-12 text-center">
      <p className="text-[var(--color-ink-soft)]">Nema vozača u sustavu.</p>
      <p className="text-xs text-[var(--color-ink-muted)] mt-2">
        Dodaj prvog vozača klikom na "+ Novi vozač".
      </p>
    </div>
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

export default DriversPage;