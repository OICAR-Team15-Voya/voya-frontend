import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { reservationService } from '../services/reservationService';
import { userService } from '../services/userService';
import { vehicleCategoryService } from '../services/vehicleCategoryService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import type { User, VehicleCategory } from '../types';

function ReservationFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [clients, setClients] = useState<User[]>([]);
  const [categories, setCategories] = useState<VehicleCategory[]>([]);

  const [userId, setUserId] = useState<number | ''>('');
  const [vehicleCategoryId, setVehicleCategoryId] = useState<number | ''>('');
  const [time, setTime] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [passengerNumber, setPassengerNumber] = useState('');
  const [luggageNumber, setLuggageNumber] = useState('');
  const [welcomeSign, setWelcomeSign] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [usersList, catsList] = await Promise.all([
        userService.getAll(),
        vehicleCategoryService.getAll(),
      ]);
      setClients(usersList.filter((u) => u.role === 'CLIENT' && u.status));
      setCategories(catsList);

      if (isEditMode && id) {
        const r = await reservationService.getById(Number(id));
        setUserId(r.userId);
        setVehicleCategoryId(r.vehicleCategoryId);
        setTime(r.time.slice(0, 16)); // YYYY-MM-DDTHH:mm format za datetime-local
        setPickupLocation(r.pickupLocation);
        setDropoffLocation(r.dropoffLocation);
        setPassengerNumber(r.passengerNumber?.toString() || '');
        setLuggageNumber(r.luggageNumber?.toString() || '');
        setWelcomeSign(r.welcomeSign || '');
        setAdditionalNotes(r.additionalNotes || '');
      }
    } catch (err) {
      setError('Greška pri učitavanju.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, isEditMode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!userId || !vehicleCategoryId) {
      setError('Odaberi klijenta i kategoriju.');
      return;
    }
    setError('');
    setSubmitting(true);

    const payload = {
      userId: Number(userId),
      vehicleCategoryId: Number(vehicleCategoryId),
      time: new Date(time).toISOString(),
      pickupLocation,
      dropoffLocation,
      passengerNumber: passengerNumber ? Number(passengerNumber) : null,
      luggageNumber: luggageNumber ? Number(luggageNumber) : null,
      welcomeSign: welcomeSign || null,
      additionalNotes: additionalNotes || null,
    };

    try {
      if (isEditMode && id) {
        // U edit modu ova forma šalje samo osnovne podatke;
        // dodjelu vozača/vozila i status ostavljamo detaljnoj stranici
        await reservationService.update(Number(id), {
          ...payload,
          status: 'CONFIRMED',
          isPaid: false,
        });
      } else {
        await reservationService.create(payload);
      }
      navigate('/reservations');
    } catch (err) {
      setError('Greška pri spremanju.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-sm text-[var(--color-ink-soft)]">Učitavanje...</div>;
  }

  if (clients.length === 0 || categories.length === 0) {
    return (
      <div className="p-8">
        <h1
          className="text-4xl font-light mb-4"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Nedostaju preduvjeti
        </h1>
        <p className="text-sm text-[var(--color-ink-soft)] mb-6">
          Za kreiranje rezervacije treba postojati barem jedan klijent i jedna kategorija vozila.
        </p>
        <div className="flex gap-3">
          {clients.length === 0 && (
            <Button onClick={() => navigate('/users')}>Idi na korisnike</Button>
          )}
          {categories.length === 0 && (
            <Button onClick={() => navigate('/vehicle-categories')}>
              Idi na kategorije
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="text-[10px] tracking-[0.3em] text-[var(--color-ink-muted)] mb-2 uppercase">
        {isEditMode ? 'Uredi rezervaciju' : 'Novi unos'}
      </div>
      <h1
        className="text-4xl font-light mb-10"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {isEditMode ? 'Uredi rezervaciju' : 'Nova rezervacija'}
      </h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Klijent */}
        <Select
          label="Klijent"
          value={userId}
          onChange={setUserId}
          options={clients.map((c) => ({
            value: c.id,
            label: `${c.firstName} ${c.lastName || ''} · ${c.email}`,
          }))}
        />

        {/* Termin + Kategorija */}
        <div className="grid grid-cols-2 gap-6">
          <Input
            name="time"
            type="datetime-local"
            label="Termin"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
          <Select
            label="Kategorija vozila"
            value={vehicleCategoryId}
            onChange={setVehicleCategoryId}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />
        </div>

        {/* Ruta */}
        <Input
          name="pickupLocation"
          label="Mjesto preuzimanja"
          value={pickupLocation}
          onChange={(e) => setPickupLocation(e.target.value)}
          placeholder="npr. Aerodrom Franjo Tuđman"
          required
        />
        <Input
          name="dropoffLocation"
          label="Odredište"
          value={dropoffLocation}
          onChange={(e) => setDropoffLocation(e.target.value)}
          placeholder="npr. Gyms4You Špansko, Zagreb"
          required
        />

        {/* Putnici */}
        <div className="grid grid-cols-2 gap-6">
          <Input
            name="passengerNumber"
            type="number"
            label="Broj putnika"
            value={passengerNumber}
            onChange={(e) => setPassengerNumber(e.target.value)}
            min={1}
          />
          <Input
            name="luggageNumber"
            type="number"
            label="Broj prtljage"
            value={luggageNumber}
            onChange={(e) => setLuggageNumber(e.target.value)}
            min={0}
          />
        </div>

        {/* Detalji */}
        <Input
          name="welcomeSign"
          label="Welcome sign (opcionalno)"
          value={welcomeSign}
          onChange={(e) => setWelcomeSign(e.target.value)}
          placeholder="npr. Mike O'Hearn"
        />

        <TextArea
          label="Dodatne napomene (opcionalno)"
          value={additionalNotes}
          onChange={setAdditionalNotes}
          placeholder="Klijent dolazi s djetetom, treba dječje sjedalo..."
        />

        {error && (
          <div className="text-xs text-[var(--color-danger)] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-3 py-2 rounded-sm">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 pt-4 border-t border-[var(--color-rule)]">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Sprema...' : 'Spremi'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/reservations')}
          >
            Odustani
          </Button>
        </div>
      </form>
    </div>
  );
}

/* ---------- Lokalne komponente ---------- */

interface SelectOption {
  value: number;
  label: string;
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: number | '';
  onChange: (v: number | '') => void;
  options: SelectOption[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] tracking-[0.2em] text-[var(--color-ink-muted)] uppercase">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
        required
        className="w-full bg-transparent border-b border-[var(--color-rule-strong)] py-2 text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
      >
        <option value="" className="bg-[var(--color-surface)]">— odaberi —</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[var(--color-surface)]">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] tracking-[0.2em] text-[var(--color-ink-muted)] uppercase">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full bg-transparent border border-[var(--color-rule-strong)] rounded-sm p-3 text-sm text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)] transition-colors resize-none"
      />
    </div>
  );
}

export default ReservationFormPage;