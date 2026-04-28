import { useState } from 'react';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');

    try {
      const response = await api.post('/voya/api/auth/login', {
        email: email,
        password: password,
      });

      console.log('Login uspješan:', response.data);
      localStorage.setItem('token', response.data.token);
      navigate('/');
    } catch (err) {
      setError('Pogrešan email ili lozinka.');
      console.error(err);
    }
  }

  return (
    <div>
      <h1>Prijava</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Lozinka:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit">Prijavi se</button>

        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}

export default LoginPage;