import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { reservationService } from '../services/reservationService';
import { Button } from '../components/ui/Button';
import type { Reservation, ReservationStatus } from '../types';

type StatusFilter = 'ALL' | ReservationStatus;

function ReservationsPage() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  
  

  const fetchReservations = useCallback(async () => {
    try {
      const data = await reservationService.getAll();
      // Sortiraj po vremenu — najnovije prvo
      data.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setReservations(data);
    } catch (err) {
      setError('Greška pri dohvaćanju rezervacija.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  if (loading) return <PageMessage>Učitavanje...</PageMessage>;
  if (error) return <PageMessage tone="error">{error}</PageMessage>;

  const filtered =
    statusFilter === 'ALL'
      ? reservations
      : reservations.filter((r) => r.status === statusFilter);

  const counts = {
    ALL: reservations.length,
    CONFIRMED: reservations.filter((r) => r.status === 'CONFIRMED').length,
    IN_PROGRESS: reservations.filter((r) => r.status === 'IN_PROGRESS').length,
    COMPLETED: reservations.filter((r) => r.status === 'COMPLETED').length,
    CANCELLED: reservations.filter((r) => r.status === 'CANCELLED').length,
  };

  return (
    <div className="p-8">
      <div className="text-[10px] tracking-[0.3em] text-[var(--color-ink-muted)] mb-2 uppercase">
        Operativa
      </div>
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <h1
            className="text-4xl font-light"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Rezervacije
          </h1>
          <div className="text-sm text-[var(--color-ink-muted)] mt-1">
            Ukupno: <span className="text-[var(--color-ink)]">{reservations.length}</span>
          </div>
        </div>
        <Button onClick={() => navigate('/reservations/new')}>+ Nova rezervacija</Button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-[var(--color-rule)]">
        <FilterTab
          label="Sve"
          count={counts.ALL}
          active={statusFilter === 'ALL'}
          onClick={() => setStatusFilter('ALL')}
        />
        <FilterTab
          label="Potvrđeno"
          count={counts.CONFIRMED}
          active={statusFilter === 'CONFIRMED'}
          onClick={() => setStatusFilter('CONFIRMED')}
        />
        <FilterTab
          label="U tijeku"
          count={counts.IN_PROGRESS}
          active={statusFilter === 'IN_PROGRESS'}
          onClick={() => setStatusFilter('IN_PROGRESS')}
        />
        <FilterTab
          label="Završeno"
          count={counts.COMPLETED}
          active={statusFilter === 'COMPLETED'}
          onClick={() => setStatusFilter('COMPLETED')}
        />
        <FilterTab
          label="Otkazano"
          count={counts.CANCELLED}
          active={statusFilter === 'CANCELLED'}
          onClick={() => setStatusFilter('CANCELLED')}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState statusFilter={statusFilter} />
      ) : (
        <div className="bg-[var(--color-surface)] border border-[var(--color-rule)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-rule)] text-left">
                <Th>ID</Th>
                <Th>Termin</Th>
                <Th>Klijent</Th>
                <Th>Ruta</Th>
                <Th>Kategorija</Th>
                <Th>Vozač</Th>
                <Th>Status</Th>
                <Th className="text-right">Cijena</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => navigate(`/reservations/${r.id}`)}
                  className="border-b border-[var(--color-rule)] last:border-b-0 hover:bg-[var(--color-surface-elevated)] transition-colors cursor-pointer"
                >
                  <Td className="text-[var(--color-ink-muted)]">#{r.id}</Td>
                  <Td>
                    <DateTime value={r.time} />
                  </Td>
                  <Td>
                    <div>{r.userFirstName} {r.userLastName}</div>
                    <div className="text-xs text-[var(--color-ink-muted)]">{r.userEmail}</div>
                  </Td>
                  <Td>
                    <RouteCell pickup={r.pickupLocation} dropoff={r.dropoffLocation} />
                  </Td>
                  <Td className="text-[var(--color-ink-soft)]">{r.vehicleCategoryName}</Td>
                  <Td>
                    {r.driverFirstName ? (
                      <span>{r.driverFirstName} {r.driverLastName}</span>
                    ) : (
                      <span className="text-[var(--color-warning)] text-xs">
                        Nedodijeljen
                      </span>
                    )}
                  </Td>
                  <Td>
                    <StatusBadge status={r.status} />
                  </Td>
                  <Td className="text-right">
                    <PriceCell price={r.price} isPaid={r.isPaid} />
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

/* ---------- Lokalne komponente ---------- */

function FilterTab({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm transition-colors border-b-2 -mb-px ${
        active
          ? 'text-[var(--color-gold)] border-[var(--color-gold)]'
          : 'text-[var(--color-ink-soft)] border-transparent hover:text-[var(--color-ink)]'
      }`}
    >
      {label}
      <span className="ml-2 text-xs text-[var(--color-ink-muted)]">{count}</span>
    </button>
  );
}

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

function DateTime({ value }: { value: string }) {
  const date = new Date(value);
  const dateStr = date.toLocaleDateString('hr-HR');
  const timeStr = date.toLocaleTimeString('hr-HR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return (
    <div>
      <div>{dateStr}</div>
      <div className="text-xs text-[var(--color-ink-muted)]">{timeStr}</div>
    </div>
  );
}

function RouteCell({ pickup, dropoff }: { pickup: string; dropoff: string }) {
  return (
    <div className="text-xs">
      <div className="text-[var(--color-ink)]">
        <span className="text-[var(--color-ink-muted)] mr-1">↑</span>
        {pickup}
      </div>
      <div className="text-[var(--color-ink-soft)]">
        <span className="text-[var(--color-ink-muted)] mr-1">↓</span>
        {dropoff}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ReservationStatus }) {
  const config: Record<ReservationStatus, { label: string; tone: string }> = {
    CONFIRMED: {
      label: 'Potvrđeno',
      tone: 'text-[var(--color-ink)] border-[var(--color-rule-strong)]',
    },
    IN_PROGRESS: {
      label: 'U tijeku',
      tone: 'text-[var(--color-gold)] border-[var(--color-gold)]/40',
    },
    COMPLETED: {
      label: 'Završeno',
      tone: 'text-[var(--color-success)] border-[var(--color-success)]/40',
    },
    CANCELLED: {
      label: 'Otkazano',
      tone: 'text-[var(--color-ink-muted)] border-[var(--color-rule)]',
    },
  };
  const c = config[status];
  return (
    <span
      className={`inline-block px-2 py-0.5 text-[10px] tracking-[0.15em] uppercase border ${c.tone}`}
    >
      {c.label}
    </span>
  );
}

function PriceCell({ price, isPaid }: { price: number | null; isPaid: boolean }) {
  if (price === null) {
    return <span className="text-[var(--color-ink-muted)] text-xs">—</span>;
  }
  return (
    <div>
      <div className="font-mono">{price.toFixed(2)} €</div>
      <div className={`text-xs ${isPaid ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'}`}>
        {isPaid ? 'Plaćeno' : 'Neplaćeno'}
      </div>
    </div>
  );
}

function EmptyState({ statusFilter }: { statusFilter: StatusFilter }) {
  const message =
    statusFilter === 'ALL'
      ? 'Nema rezervacija.'
      : 'Nema rezervacija s tim statusom.';
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-rule)] p-12 text-center">
      <p className="text-[var(--color-ink-soft)]">{message}</p>
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

export default ReservationsPage;