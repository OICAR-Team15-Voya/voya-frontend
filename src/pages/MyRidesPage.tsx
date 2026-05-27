import { useEffect, useState, useCallback } from 'react';
import { reservationService } from '../services/reservationService';
import { Button } from '../components/ui/Button';
import type { Reservation, ReservationStatus } from '../types';


//page za vozače da vide svoje vožnje, pokrenu ih i završe
function MyRidesPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState<number | null>(null);

  const fetchRides = useCallback(async () => {
    try {
      const data = await reservationService.getMyRides();
      // Aktivne prvo (CONFIRMED, IN_PROGRESS), pa po vremenu
      data.sort((a, b) => {
        const aActive = a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS';
        const bActive = b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS';
        if (aActive && !bActive) return -1;
        if (!aActive && bActive) return 1;
        return new Date(a.time).getTime() - new Date(b.time).getTime();
      });
      setReservations(data);
    } catch (err) {
      setError('Greška pri dohvaćanju vožnji.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRides();
  }, [fetchRides]);

  async function handleStart(id: number) {
    setActionId(id);
    try {
      await reservationService.setInProgress(id);
      await fetchRides();
    } catch (err) {
      console.error(err);
      alert('Greška pri pokretanju vožnje.');
    } finally {
      setActionId(null);
    }
  }

  async function handleComplete(id: number) {
    setActionId(id);
    try {
      await reservationService.setCompleted(id);
      await fetchRides();
    } catch (err) {
      console.error(err);
      alert('Greška pri završavanju vožnje.');
    } finally {
      setActionId(null);
    }
  }

  if (loading) return <PageMessage>Učitavanje...</PageMessage>;
  if (error) return <PageMessage tone="error">{error}</PageMessage>;

  const active = reservations.filter(
    (r) => r.status === 'CONFIRMED' || r.status === 'IN_PROGRESS',
  );
  const history = reservations.filter(
    (r) => r.status === 'COMPLETED' || r.status === 'CANCELLED',
  );

  return (
    <div className="p-8 max-w-4xl">
      <div className="text-[10px] tracking-[0.3em] text-[var(--color-ink-muted)] mb-2 uppercase">
        Vozač
      </div>
      <h1
        className="text-4xl font-light mb-2"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Moje vožnje
      </h1>
      <p className="text-sm text-[var(--color-ink-muted)] mb-10">
        Aktivne vožnje su prvo. Klikni dugme za promjenu statusa.
      </p>

      {/* Aktivne vožnje */}
      <Section title={`Aktivne (${active.length})`}>
        {active.length === 0 ? (
          <EmptyState message="Nema aktivnih vožnji." />
        ) : (
          <div className="space-y-3">
            {active.map((r) => (
              <ActiveRideCard
                key={r.id}
                reservation={r}
                processing={actionId === r.id}
                onStart={() => handleStart(r.id)}
                onComplete={() => handleComplete(r.id)}
              />
            ))}
          </div>
        )}
      </Section>

      {/* Povijest */}
      {history.length > 0 && (
        <Section title={`Povijest (${history.length})`}>
          <div className="bg-[var(--color-surface)] border border-[var(--color-rule)]">
            {history.map((r, index) => (
              <HistoryRow
                key={r.id}
                reservation={r}
                isLast={index === history.length - 1}
              />
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

/* ---------- Sekcije i kartice ---------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <div className="text-[10px] tracking-[0.2em] text-[var(--color-ink-muted)] uppercase mb-4">
        {title}
      </div>
      {children}
    </div>
  );
}

function ActiveRideCard({
  reservation,
  processing,
  onStart,
  onComplete,
}: {
  reservation: Reservation;
  processing: boolean;
  onStart: () => void;
  onComplete: () => void;
}) {
  const r = reservation;
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-rule)] p-6">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 min-w-0">
          {/* Vrijeme + status */}
          <div className="flex items-center gap-3 mb-3">
            <div className="text-xs text-[var(--color-ink-muted)] font-mono">
              <DateTime value={r.time} />
            </div>
            <StatusBadge status={r.status} />
          </div>

          {/* Ruta */}
          <div className="space-y-1 mb-4">
            <div className="flex items-start gap-2">
              <span className="text-[var(--color-gold)] text-xs mt-1">↑</span>
              <div className="text-base text-[var(--color-ink)]">{r.pickupLocation}</div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[var(--color-ink-muted)] text-xs mt-1">↓</span>
              <div className="text-base text-[var(--color-ink-soft)]">{r.dropoffLocation}</div>
            </div>
          </div>

          {/* Klijent + ostali detalji */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <Detail label="Klijent">
              {r.userFirstName} {r.userLastName}
            </Detail>
            <Detail label="Vozilo">
              {r.vehicleName || r.vehicleRegistration || '—'}
            </Detail>
            {r.passengerNumber !== null && (
              <Detail label="Putnici">{r.passengerNumber}</Detail>
            )}
            {r.luggageNumber !== null && (
              <Detail label="Prtljaga">{r.luggageNumber}</Detail>
            )}
            {r.welcomeSign && (
              <Detail label="Welcome sign">{r.welcomeSign}</Detail>
            )}
          </div>

          {r.additionalNotes && (
            <div className="mt-4 pt-4 border-t border-[var(--color-rule)]">
              <Detail label="Napomena">{r.additionalNotes}</Detail>
            </div>
          )}
        </div>

        {/* Akcija */}
        <div className="flex-shrink-0">
          {r.status === 'CONFIRMED' && (
            <Button onClick={onStart} disabled={processing}>
              {processing ? 'Pokreće...' : 'Krećem'}
            </Button>
          )}
          {r.status === 'IN_PROGRESS' && (
            <Button onClick={onComplete} disabled={processing}>
              {processing ? 'Završava...' : 'Završeno'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function HistoryRow({
  reservation,
  isLast,
}: {
  reservation: Reservation;
  isLast: boolean;
}) {
  const r = reservation;
  return (
    <div
      className={`flex items-center justify-between gap-4 px-6 py-4 ${
        isLast ? '' : 'border-b border-[var(--color-rule)]'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="text-xs text-[var(--color-ink-muted)] font-mono mb-1">
          <DateTime value={r.time} />
        </div>
        <div className="text-sm text-[var(--color-ink-soft)] truncate">
          {r.pickupLocation} → {r.dropoffLocation}
        </div>
      </div>
      <StatusBadge status={r.status} />
    </div>
  );
}

/* ---------- Helperi ---------- */

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[9px] tracking-[0.15em] text-[var(--color-ink-muted)] uppercase mb-0.5">
        {label}
      </div>
      <div className="text-[var(--color-ink)]">{children}</div>
    </div>
  );
}

function DateTime({ value }: { value: string }) {
  const d = new Date(value);
  return (
    <span>
      {d.toLocaleDateString('hr-HR')} <span className="text-[var(--color-ink-muted)]">·</span>{' '}
      {d.toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })}
    </span>
  );
}

function StatusBadge({ status }: { status: ReservationStatus }) {
  const config: Record<ReservationStatus, { label: string; tone: string }> = {
    CONFIRMED: { label: 'Potvrđeno', tone: 'text-[var(--color-ink)] border-[var(--color-rule-strong)]' },
    IN_PROGRESS: { label: 'U tijeku', tone: 'text-[var(--color-gold)] border-[var(--color-gold)]/40' },
    COMPLETED: { label: 'Završeno', tone: 'text-[var(--color-success)] border-[var(--color-success)]/40' },
    CANCELLED: { label: 'Otkazano', tone: 'text-[var(--color-ink-muted)] border-[var(--color-rule)]' },
  };
  const c = config[status];
  return (
    <span className={`inline-block px-2 py-0.5 text-[10px] tracking-[0.15em] uppercase border ${c.tone}`}>
      {c.label}
    </span>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-rule)] p-8 text-center">
      <p className="text-sm text-[var(--color-ink-soft)]">{message}</p>
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

export default MyRidesPage;