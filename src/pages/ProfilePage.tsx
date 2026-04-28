import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  role: string;
  status: boolean;
}

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchUser() {
      try {
        const userJson = localStorage.getItem('currentUser');
        if (!userJson) {
          setError('Nema podataka o korisniku.');
          setLoading(false);
          return;
        }
        const currentUser = JSON.parse(userJson);

        const response = await api.get(`/voya/api/users/${currentUser.userId}`);
        setUser(response.data);
      } catch (err) {
        setError('Greška pri dohvaćanju profila.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  if (loading) return <p>Učitavanje...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!user) return null;

  return (
    <div>
      <h1>Moj profil</h1>
      <p><strong>Ime:</strong> {user.firstName} {user.lastName}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Telefon:</strong> {user.phone || '—'}</p>
      <p><strong>Uloga:</strong> {user.role}</p>
      <p><strong>Status:</strong> {user.status ? 'Aktivan' : 'Neaktivan'}</p>

      <button onClick={() => navigate('/')}>Natrag na home</button>
    </div>
  );
}

export default ProfilePage;