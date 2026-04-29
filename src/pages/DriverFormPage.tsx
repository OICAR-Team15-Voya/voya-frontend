import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';

interface Driver {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseValidUntil: string;
}

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
    try {
      const response = await api.get<Driver>(`/voya/api/drivers/${id}`);
      const d = response.data;
      setFirstName(d.firstName);
      setLastName(d.lastName);
      setEmail(d.email);
      setPhone(d.phone);
      setLicenseValidUntil(d.licenseValidUntil);
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
      if (isEditMode) {
        await api.put(`/voya/api/drivers/${id}`, {
          firstName,
          lastName,
          email,
          phone,
          licenseValidUntil,
        });
      } else {
        await api.post('/voya/api/drivers', {
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

  if (loading) return <p>Učitavanje...</p>;

  return (
    <div>
      <h1>{isEditMode ? 'Uredi vozača' : 'Novi vozač'}</h1>

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

        {!isEditMode && (
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
        )}

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