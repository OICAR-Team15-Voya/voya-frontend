import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { vehicleService } from '../services/vehicleService';
import { vehicleCategoryService } from '../services/vehicleCategoryService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import type { VehicleCategory } from '../types';

function VehicleFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [vehicleCategoryId, setVehicleCategoryId] = useState<number | ''>('');
  const [name, setName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [registration, setRegistration] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      const cats = await vehicleCategoryService.getAll();
      setCategories(cats);

      if (isEditMode && id) {
        const vehicle = await vehicleService.getById(Number(id));
        setVehicleCategoryId(vehicle.vehicleCategoryId);
        setName(vehicle.name || '');
        setManufacturer(vehicle.manufacturer);
        setModel(vehicle.model);
        setRegistration(vehicle.registration);
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
    if (!vehicleCategoryId) {
      setError('Odaberi kategoriju.');
      return;
    }

    setError('');
    setSubmitting(true);

    const payload = {
      vehicleCategoryId: Number(vehicleCategoryId),
      name,
      manufacturer,
      model,
      registration,
    };

    try {
      if (isEditMode && id) {
        await vehicleService.update(Number(id), payload);
      } else {
        await vehicleService.create(payload);
      }
      navigate('/vehicles');
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

  if (categories.length === 0) {
    return (
      <div className="p-8">
        <h1
          className="text-4xl font-light mb-4"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Nema kategorija
        </h1>
        <p className="text-sm text-[var(--color-ink-soft)] mb-6">
          Prvo dodaj kategoriju vozila prije nego dodaš vozilo.
        </p>
        <Button onClick={() => navigate('/vehicle-categories')}>
          Idi na kategorije
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="text-[10px] tracking-[0.3em] text-[var(--color-ink-muted)] mb-2 uppercase">
        {isEditMode ? 'Uredi vozilo' : 'Novi unos'}
      </div>
      <h1
        className="text-4xl font-light mb-10"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {isEditMode ? 'Uredi vozilo' : 'Novo vozilo'}
      </h1>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
        <CategorySelect
          categories={categories}
          value={vehicleCategoryId}
          onChange={setVehicleCategoryId}
        />

        <Input
          name="name"
          label="Interni naziv (opcionalno)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="npr. Auto direktora"
        />

        <div className="grid grid-cols-2 gap-6">
          <Input
            name="manufacturer"
            label="Proizvođač"
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
            placeholder="Mercedes-Benz"
            required
          />
          <Input
            name="model"
            label="Model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="S-Class"
            required
          />
        </div>

        <Input
          name="registration"
          label="Registracija"
          value={registration}
          onChange={(e) => setRegistration(e.target.value.toUpperCase())}
          placeholder="ZG-0000-BB"
          required
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
            onClick={() => navigate('/vehicles')}
          >
            Odustani
          </Button>
        </div>
      </form>
    </div>
  );
}

/* ---------- Custom select za kategoriju ---------- */

function CategorySelect({
  categories,
  value,
  onChange,
}: {
  categories: VehicleCategory[];
  value: number | '';
  onChange: (id: number | '') => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="vehicleCategory"
        className="text-[10px] tracking-[0.2em] text-[var(--color-ink-muted)] uppercase"
      >
        Kategorija
      </label>
      <select
        id="vehicleCategory"
        value={value}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
        required
        className="w-full bg-transparent border-b border-[var(--color-rule-strong)] py-2 text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)] transition-colors"
      >
        <option value="" className="bg-[var(--color-surface)]">— odaberi —</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id} className="bg-[var(--color-surface)]">
            {cat.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default VehicleFormPage;