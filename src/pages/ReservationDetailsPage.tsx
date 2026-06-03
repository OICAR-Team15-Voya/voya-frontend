import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { reservationService } from '../services/reservationService';
import { driverService } from '../services/driverService';
import { vehicleService } from '../services/vehicleService';
import { Button } from '../components/ui/Button';
import type { Reservation, Driver, Vehicle, ReservationStatus } from '../types';

function ReservationDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const [r, allDrivers, allVehicles] = await Promise.all([
        reservationService.getById(Number(id)),
        driverService.getAll(),
        vehicleService.getAllActive(),
      ]);
      setReservation(r);
      setDrivers(allDrivers);
      setVehicles(allVehicles);
    } catch (err) {
      setError('Greška pri učitavanju rezervacije.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function saveAssignment(driverId: number | null, vehicleId: number | null, price: number | null, isPaid: boolean) {
    if (!reservation || !id) return;
    setSaving(true);
    try {
      await reservationService.update(Number(id), {
        vehicleCategoryId: reservation.vehicleCategoryId,
        driverId,
        vehicleId,
        time: reservation.time,
        pickupLocation: reservation.pickupLocation,
        dropoffLocation: reservation.dropoffLocation,
        passengerNumber: reservation.passengerNumber,
        luggageNumber: reservation.luggageNumber,
        welcomeSign: reservation.welcomeSign,
        additionalNotes: reservation.additionalNotes,
        status: reservation.status,
        price,
        isPaid,
      });
      await loadData();
    } catch (err) {
      console.error(err);
      alert('Greška pri spremanju.');
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(newStatus: 'IN_PROGRESS' | 'COMPLETED') {
    if (!id) return;
    setSaving(true);
    try {
      if (newStatus === 'IN_PROGRESS') {
        await reservationService.setInProgress(Number(id));
      } else {
        await reservationService.setCompleted(Number(id));
      }
      await loadData();
    } catch (err) {
      console.error(err);
      alert('Greška pri promjeni statusa.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    if (!window.confirm('Sigurno obrisati rezervaciju?')) return;
    try {
      await reservationService.delete(Number(id));
      navigate('/reservations');
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <PageMessage>Učitavanje...</PageMessage>;
  if (error) return <PageMessage tone="error">{error}</PageMessage>;
  if (!reservation) return null;

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="text-[10px] tracking-[0.3em] text-[var(--color-ink-muted)] mb-2 uppercase">
        Rezervacija #{reservation.id}
      </div>
      <div className="flex items-baseline justify-between mb-10">
        <h1
          className="text-4xl font-light"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {reservation.pickupLocation}
          <span className="text-[var(--color-ink-muted)] mx-3">→</span>
          {reservation.dropoffLocation}
        </h1>
       <div className="flex items-center gap-3">
    <Button
      variant="outline"
      onClick={() => navigate(`/reservations/${id}/edit`)}
    >
      Uredi detalje
    </Button>
    <StatusBadge status={reservation.status} />
  </div>
</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lijevo — informacije */}
        <div className="space-y-6">
          <Card title="Klijent">
            <DataRow label="Ime">{reservation.userFirstName} {reservation.userLastName}</DataRow>
            <DataRow label="Email">{reservation.userEmail}</DataRow>
          </Card>

          <Card title="Detalji vožnje">
            <DataRow label="Termin">
              <DateTime value={reservation.time} />
            </DataRow>
            <DataRow label="Kategorija">{reservation.vehicleCategoryName}</DataRow>
            <DataRow label="Putnici">{reservation.passengerNumber ?? '—'}</DataRow>
            <DataRow label="Prtljaga">{reservation.luggageNumber ?? '—'}</DataRow>
            <DataRow label="Welcome sign">{reservation.welcomeSign || '—'}</DataRow>
            <DataRow label="Napomene" last>
              {reservation.additionalNotes || '—'}
            </DataRow>
          </Card>
        </div>

        {/* Desno — akcije */}
        <div className="space-y-6">
          <AssignmentPanel
            reservation={reservation}
            drivers={drivers}
            vehicles={vehicles}
            saving={saving}
            onSave={saveAssignment}
          />

          <StatusPanel
            status={reservation.status}
            hasDriver={reservation.driverId !== null}
            saving={saving}
            onStatusChange={handleStatusChange}
          />

          <div className="bg-[var(--color-surface)] border border-[var(--color-rule)] p-6">
            <div className="text-[10px] tracking-[0.2em] text-[var(--color-ink-muted)] uppercase mb-4">
              Opasna zona
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-[var(--color-ink-soft)]">
                Brisanje rezervacije je trajno.
              </div>
              <Button variant="danger" onClick={handleDelete} className="!py-1.5 !px-3 text-xs">
                Obriši
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-[var(--color-rule)]">
        <Button variant="ghost" onClick={() => navigate('/reservations')}>
          ← Natrag na popis
        </Button>
      </div>
    </div>
  );
}

/* ---------- Panels ---------- */

function AssignmentPanel({
  reservation,
  drivers,
  vehicles,
  saving,
  onSave,
}: {
  reservation: Reservation;
  drivers: Driver[];
  vehicles: Vehicle[];
  saving: boolean;
  onSave: (driverId: number | null, vehicleId: number | null, price: number | null, isPaid: boolean) => Promise<void>;
}) {
  const [driverId, setDriverId] = useState<number | ''>(reservation.driverId || '');
  const [vehicleId, setVehicleId] = useState<number | ''>(reservation.vehicleId || '');
  const [price, setPrice] = useState(reservation.price?.toString() || '');
  const [isPaid, setIsPaid] = useState(reservation.isPaid);

  // Filtriraj vozila po kategoriji rezervacije
  const compatibleVehicles = vehicles.filter(
    (v) => v.vehicleCategoryId === reservation.vehicleCategoryId,
  );

  function handleSave() {
    onSave(
      driverId ? Number(driverId) : null,
      vehicleId ? Number(vehicleId) : null,
      price ? Number(price) : null,
      isPaid,
    );
  }

  return (
    <Card title="Dodjela i naplata">
      <div className="px-6 py-4 space-y-4">
        <PanelSelect
          label="Vozač"
          value={driverId}
          onChange={setDriverId}
          options={drivers.map((d) => ({
            value: d.id,
            label: `${d.firstName} ${d.lastName}`,
          }))}
          allowEmpty
        />

        <PanelSelect
          label="Vozilo"
          value={vehicleId}
          onChange={setVehicleId}
          options={compatibleVehicles.map((v) => ({
            value: v.id,
            label: `${v.manufacturer} ${v.model} · ${v.registration}`,
          }))}
          allowEmpty
          emptyMessage={
            compatibleVehicles.length === 0
              ? `Nema aktivnih vozila kategorije ${reservation.vehicleCategoryName}`
              : undefined
          }
        />

        <div>
          <label className="text-[10px] tracking-[0.2em] text-[var(--color-ink-muted)] uppercase block mb-2">
            Cijena (€)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full bg-transparent border-b border-[var(--color-rule-strong)] py-2 text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
          />
        </div>

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={isPaid}
            onChange={(e) => setIsPaid(e.target.checked)}
            className="accent-[var(--color-gold)]"
          />
          <span className="text-[var(--color-ink)]">Plaćeno</span>
        </label>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? 'Sprema...' : 'Spremi dodjelu'}
        </Button>
      </div>
    </Card>
  );
}

function StatusPanel({
  status,
  hasDriver,
  saving,
  onStatusChange,
}: {
  status: ReservationStatus;
  hasDriver: boolean;
  saving: boolean;
  onStatusChange: (s: 'IN_PROGRESS' | 'COMPLETED') => void;
}) {
  return (
    <Card title="Status">
      <div className="px-6 py-4 space-y-3">
        <p className="text-sm text-[var(--color-ink-soft)]">
          Trenutni status: <StatusBadge status={status} />
        </p>

        {
        /* {status === 'CONFIRMED' && (
          <Button
            onClick={() => onStatusChange('IN_PROGRESS')}
            disabled={saving || !hasDriver}
            className="w-full"
          >
            Pokreni vožnju
          </Button>
        )}  */
        }

        {status === 'IN_PROGRESS' && (
          <Button
            onClick={() => onStatusChange('COMPLETED')}
            disabled={saving}
            className="w-full"
          >
            Označi kao završeno
          </Button>
        )}

        {!hasDriver && status === 'CONFIRMED' && (
          <p className="text-xs text-[var(--color-warning)]">
            Dodijeli vozača prije pokretanja vožnje.
          </p>
        )}

        {(status === 'COMPLETED' || status === 'CANCELLED') && (
          <p className="text-xs text-[var(--color-ink-muted)]">
            Rezervacija je {status === 'COMPLETED' ? 'završena' : 'otkazana'}.
          </p>
        )}
      </div>
    </Card>
  );
}

/* ---------- Helpers ---------- */

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-rule)]">
      <div className="px-6 py-3 border-b border-[var(--color-rule)] text-[10px] tracking-[0.2em] text-[var(--color-ink-muted)] uppercase">
        {title}
      </div>
      {children}
    </div>
  );
}

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
      className={`flex items-start px-6 py-3 ${
        last ? '' : 'border-b border-[var(--color-rule)]'
      }`}
    >
      <div className="w-28 text-[10px] tracking-[0.2em] text-[var(--color-ink-muted)] uppercase pt-0.5 flex-shrink-0">
        {label}
      </div>
      <div className="flex-1 text-sm text-[var(--color-ink)]">{children}</div>
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

function PanelSelect({
  label,
  value,
  onChange,
  options,
  allowEmpty = false,
  emptyMessage,
}: {
  label: string;
  value: number | '';
  onChange: (v: number | '') => void;
  options: { value: number; label: string }[];
  allowEmpty?: boolean;
  emptyMessage?: string;
}) {
  return (
    <div>
      <label className="text-[10px] tracking-[0.2em] text-[var(--color-ink-muted)] uppercase block mb-2">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
        className="w-full bg-transparent border-b border-[var(--color-rule-strong)] py-2 text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
      >
        {allowEmpty && (
          <option value="" className="bg-[var(--color-surface)]">
            — nedodijeljeno —
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[var(--color-surface)]">
            {opt.label}
          </option>
        ))}
      </select>
      {emptyMessage && (
        <p className="text-xs text-[var(--color-warning)] mt-2">{emptyMessage}</p>
      )}
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

export default ReservationDetailsPage;