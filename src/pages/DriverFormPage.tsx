import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { driverService } from '../services/driverService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

function DriverFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [licenseValidUntil, setLicenseValidUntil] = useState('');

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadDriver = useCallback(async () => {
    if (!id) return;
    try {
      const driver = await driverService.getById(Number(id));
      setFirstName(driver.firstName);
      setLastName(driver.lastName);
      setEmail(driver.email);
      setPhone(driver.phone);
      setLicenseValidUntil(driver.licenseValidUntil);
    } catch (err) {
      setError('Vozač nije pronađen.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isEditMode) {
      loadDriver();
    }
  }, [isEditMode, loadDriver]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isEditMode && id) {
        await driverService.update(Number(id), {
          firstName,
          lastName,
          email,
          phone,
          licenseValidUntil,
        });
      } else {
        await driverService.create({
          firstName,
          lastName,
          email,
          phone,
          password,
          licenseValidUntil,
        });
      }
      navigate('/drivers');
    } catch (err) {
      setError('Greška pri spremanju. Možda je email zauzet.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-sm text-[var(--color-ink-soft)]">Učitavanje...</div>
    );
  }

  return (
    <div className="p-8">
      <div className="text-[10px] tracking-[0.3em] text-[var(--color-ink-muted)] mb-2 uppercase">
        {isEditMode ? 'Uredi vozača' : 'Novi unos'}
      </div>
      <h1
        className="text-4xl font-light mb-10"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {isEditMode ? 'Uredi vozača' : 'Novi vozač'}
      </h1>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <Input
            name="firstName"
            label="Ime"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <Input
            name="lastName"
            label="Prezime"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <Input
          name="email"
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          name="phone"
          type="tel"
          label="Telefon"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        {!isEditMode && (
          <Input
            name="password"
            type="password"
            label="Lozinka"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        )}

        <Input
          name="licenseValidUntil"
          type="date"
          label="Vozačka vrijedi do"
          value={licenseValidUntil}
          onChange={(e) => setLicenseValidUntil(e.target.value)}
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
            onClick={() => navigate('/drivers')}
          >
            Odustani
          </Button>
        </div>
      </form>
    </div>
  );
}

export default DriverFormPage;