import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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

function DriversPage() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDrivers = useCallback(async () => {
    try {
      const response = await api.get<Driver[]>('/voya/api/drivers/all');
      setDrivers(response.data);
    } catch (err) {
      setError('Greška pri dohvaćanju vozača.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  async function handleDelete(id: number) {
    const confirmed = window.confirm('Sigurno hoćeš obrisati vozača?');
    if (!confirmed) return;

    try {
      await api.delete(`/voya/api/drivers/${id}`);
      await fetchDrivers();
    } catch (err) {
      alert('Greška pri brisanju.');
      console.error(err);
    }
  }

  if (loading) return <p>Učitavanje...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h1>Vozači</h1>
      <button onClick={() => navigate('/drivers/new')}>
      + Novi vozač
      </button>
      <p>Ukupno: {drivers.length}</p>

      {drivers.length === 0 ? (
        <p>Nema vozača u sustavu.</p>
      ) : (
        <table border={1} cellPadding={6}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Ime</th>
              <th>Prezime</th>
              <th>Email</th>
              <th>Telefon</th>
              <th>Vozačka vrijedi do</th>
              <th>Akcije</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver) => (
              <tr key={driver.id}>
                <td>{driver.id}</td>
                <td>{driver.firstName}</td>
                <td>{driver.lastName}</td>
                <td>{driver.email}</td>
                <td>{driver.phone}</td>
                <td>{driver.licenseValidUntil}</td>
                <td>
                  <button onClick={() => handleDelete(driver.id)}>
                    Obriši
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <br />
      <button onClick={() => navigate('/')}>Natrag na home</button>
    </div>
  );
}

export default DriversPage;