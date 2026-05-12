import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { vehicleService } from '../services/vehicleService';
import { Button } from '../components/ui/Button';
import type { Vehicle } from '../types';

function VehiclesPage() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const fetchVehicles = useCallback(async () => {
    try {
      const data = await vehicleService.getAll();
      setVehicles(data);
    } catch (err) {
      setError('Greška pri dohvaćanju vozila.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  async function handleDelete(id: number) {
    if (!window.confirm('Jeste li sigurni da želite deaktivirati vozilo?')) return;
    try {
      await vehicleService.delete(id);
      await fetchVehicles();
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <PageMessage>Učitavanje...</PageMessage>;
  if (error) return <PageMessage tone="error">{error}</PageMessage>;

  const visibleVehicles = showInactive
    ? vehicles
    : vehicles.filter((v) => v.active);

  return (
    <div className="p-8">
      <div className="text-[10px] tracking-[0.3em] text-[var(--color-ink-muted)] mb-2 uppercase">
        Flota
      </div>
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <h1
            className="text-4xl font-light"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Vozila
          </h1>
          <div className="text-sm text-[var(--color-ink-muted)] mt-1">
            Prikazano: <span className="text-[var(--color-ink)]">{visibleVehicles.length}</span> od {vehicles.length}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs text-[var(--color-ink-soft)] cursor-pointer">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="accent-[var(--color-gold)]"
            />
            Prikaži neaktivna
          </label>
          <Button onClick={() => navigate('/vehicles/new')}>+ Novo vozilo</Button>
        </div>
      </div>

      {visibleVehicles.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="bg-[var(--color-surface)] border border-[var(--color-rule)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-rule)] text-left">
                <Th>ID</Th>
                <Th>Naziv</Th>
                <Th>Proizvođač / Model</Th>
                <Th>Registracija</Th>
                <Th>Kategorija</Th>
                <Th>Status</Th>
                <Th className="text-right">Akcije</Th>
              </tr>
            </thead>
            <tbody>
              {visibleVehicles.map((v) => (
                <tr
                  key={v.id}
                  className="border-b border-[var(--color-rule)] last:border-b-0 hover:bg-[var(--color-surface-elevated)] transition-colors"
                >
                  <Td className="text-[var(--color-ink-muted)]">{v.id}</Td>
                  <Td>{v.name || '—'}</Td>
                  <Td>
                    <div>{v.manufacturer}</div>
                    <div className="text-xs text-[var(--color-ink-muted)]">{v.model}</div>
                  </Td>
                  <Td>
                    <span className="font-mono text-xs tracking-wider">
                      {v.registration}
                    </span>
                  </Td>
                  <Td className="text-[var(--color-ink-soft)]">{v.categoryName}</Td>
                  <Td>
                    <StatusBadge active={v.active} />
                  </Td>
                  <Td className="text-right">
                    <div className="inline-flex gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => navigate(`/vehicles/${v.id}/edit`)}
                        className="!py-1 !px-3 text-xs"
                      >
                        Uredi
                      </Button>
                      {v.active && (
                        <Button
                          variant="danger"
                          onClick={() => handleDelete(v.id)}
                          className="!py-1 !px-3 text-xs"
                        >
                          Deaktiviraj
                        </Button>
                      )}
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
      {active ? 'Aktivno' : 'Neaktivno'}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-rule)] p-12 text-center">
      <p className="text-[var(--color-ink-soft)]">Trenutno nemate vozila.</p>
      <p className="text-xs text-[var(--color-ink-muted)] mt-2">
        Klikni "+ Novo vozilo" za dodavanje.
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

export default VehiclesPage;