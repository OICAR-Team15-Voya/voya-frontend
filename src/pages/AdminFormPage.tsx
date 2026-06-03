import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

function AdminFormPage() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await authService.registerAdmin({
        firstName,
        lastName,
        email,
        phone,
        password,
      });
      navigate('/users');
    } catch (err) {
      setError('Greška pri spremanju. Možda je email zauzet.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-8">
      <div className="text-[10px] tracking-[0.3em] text-[var(--color-ink-muted)] mb-2 uppercase">
        Novi unos
      </div>
      <h1
        className="text-4xl font-light mb-10"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Novi administrator
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

        <Input
          name="password"
          type="password"
          label="Lozinka"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
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
            onClick={() => navigate('/users')}
          >
            Odustani
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AdminFormPage;