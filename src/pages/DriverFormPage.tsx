import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

function DriverFormPage() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [licenseValidUntil, setLicenseValidUntil] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.post('/voya/api/drivers', {
        firstName,
        lastName,
        email,
        phone,
        password,
        licenseValidUntil,
      });
      navigate('/drivers');
    } catch (err) {
      setError('Greška pri kreiranju vozača. Možda je email već zauzet.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1>Novi vozač</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Ime:</label>{' '}
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Prezime:</label>{' '}
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Email:</label>{' '}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Telefon:</label>{' '}
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div>
          <label>Lozinka:</label>{' '}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        <div>
          <label>Vozačka vrijedi do:</label>{' '}
          <input
            type="date"
            value={licenseValidUntil}
            onChange={(e) => setLicenseValidUntil(e.target.value)}
            required
          />
        </div>

        <br />
        <button type="submit" disabled={submitting}>
          {submitting ? 'Sprema...' : 'Spremi'}
        </button>
        {' '}
        <button type="button" onClick={() => navigate('/drivers')}>
          Odustani
        </button>

        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}

export default DriverFormPage;