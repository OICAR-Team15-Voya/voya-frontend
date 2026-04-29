import { useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api';

interface User {
  id: number;
  role: string;
  status: boolean;
}

interface Driver {
  id: number;
}

function HomePage() {
  const userJson = localStorage.getItem('currentUser');
  const currentUser = userJson ? JSON.parse(userJson) : null;
  const isAdmin = currentUser?.role === 'ADMIN';

  const [userCount, setUserCount] = useState<number | null>(null);
  const [driverCount, setDriverCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    try {
      const [usersRes, driversRes] = await Promise.all([
        api.get<User[]>('/voya/api/users/all'),
        api.get<Driver[]>('/voya/api/drivers/all'),
      ]);
      setUserCount(usersRes.data.length);
      setDriverCount(driversRes.data.length);
    } catch (err) {
      console.error('Greška pri dohvaćanju statistika:', err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="p-8">
      <div className="text-[10px] tracking-[0.3em] text-[var(--color-ink-muted)] mb-2 uppercase">
        Pregled
      </div>
      <h1
        className="text-4xl font-light"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Dobrodošli, {currentUser?.firstName}.
      </h1>
      <p className="text-[var(--color-ink-soft)] mt-2 text-sm">
        Trenutno stanje sustava.
      </p>

      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10 max-w-2xl">
          <StatCard
            label="Korisnici"
            value={loading ? '—' : userCount?.toString() ?? '—'}
          />
          <StatCard
            label="Vozači"
            value={loading ? '—' : driverCount?.toString() ?? '—'}
          />
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-rule)] p-6">
      <div className="text-[10px] tracking-[0.2em] text-[var(--color-ink-muted)] uppercase mb-3">
        {label}
      </div>
      <div
        className="text-4xl font-light tabular-nums"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {value}
      </div>
    </div>
  );
}

export default HomePage;