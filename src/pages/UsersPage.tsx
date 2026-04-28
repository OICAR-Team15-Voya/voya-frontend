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

function UsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await api.get<User[]>('/voya/api/users/all');
        setUsers(response.data);
      } catch (err) {
        setError('Greška pri dohvaćanju korisnika.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  if (loading) return <p>Učitavanje...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h1>Svi korisnici</h1>
      <p>Ukupno: {users.length}</p>

      <table border={1} cellPadding={6}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Ime</th>
            <th>Prezime</th>
            <th>Telefon</th>
            <th>Uloga</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.email}</td>
              <td>{user.firstName}</td>
              <td>{user.lastName || '—'}</td>
              <td>{user.phone || '—'}</td>
              <td>{user.role}</td>
              <td>{user.status ? 'Aktivan' : 'Neaktivan'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <br />
      <button onClick={() => navigate('/')}>Natrag na home</button>
    </div>
  );
}

export default UsersPage;