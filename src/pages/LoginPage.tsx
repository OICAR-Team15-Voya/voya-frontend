import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import axios from 'axios';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');

    try {
      const response = await api.post('/voya/api/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('currentUser', JSON.stringify(response.data));
      navigate('/');
    } catch (err) {
      if(axios.isAxiosError(err) && err.response?.status === 403) {
        setError(err.response.data);
      } else {
          setError('Pogrešan email ili lozinka.');
        }
      console.error(err);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Brand u header-u */}
      <div className="p-8 flex items-center gap-3">
        <div
          className="text-2xl tracking-[0.3em] font-light"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          VOYA
        </div>
        <div className="h-px w-10 bg-[var(--color-gold)]" />
        <div className="text-[10px] tracking-[0.2em] text-[var(--color-gold-soft)]">
          DISPATCH CONSOLE
        </div>
      </div>

      {/* Forma centrirana */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="text-[10px] tracking-[0.3em] text-[var(--color-ink-muted)] mb-3 uppercase">
              Prijava
            </div>
            <h2
              className="text-3xl font-light"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Dobrodošli natrag.
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              name="email"
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />

            <Input
              name="password"
              type="password"
              label="Lozinka"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="text-xs text-[var(--color-danger)] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-3 py-2 rounded-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full mt-2">
              Prijavi se
            </Button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 flex items-center justify-between text-xs text-[var(--color-ink-muted)]">
        <div>Zagreb · {new Date().toLocaleDateString('hr-HR')}</div>
        <div>№ 01</div>
      </div>
    </div>
  );
}

export default LoginPage;