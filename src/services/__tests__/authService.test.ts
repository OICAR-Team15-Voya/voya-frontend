import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../authService';
import { api } from '../../lib/api';

// Mockanje axios instance - da ne radi prave HTTP pozive
vi.mock('../../lib/api', () => ({
  api: {
    post: vi.fn(),
  },
}));

const mockedPost = vi.mocked(api.post);

describe('authService', () => {
  beforeEach(() => {
    mockedPost.mockReset();
    localStorage.clear();
  });

  describe('login', () => {
    it('šalje email i password na /voya/api/auth/login', async () => {
      mockedPost.mockResolvedValueOnce({
        data: {
          token: 'fake-jwt',
          userId: 1,
          email: 'admin@test.com',
          firstName: 'Admin',
          role: 'ADMIN',
        },
      });

      await authService.login({
        email: 'admin@test.com',
        password: 'tajna123',
      });

      expect(mockedPost).toHaveBeenCalledWith('/voya/api/auth/login', {
        email: 'admin@test.com',
        password: 'tajna123',
      });
    });

    it('sprema token i korisničke podatke u localStorage nakon uspješnog logina', async () => {
      mockedPost.mockResolvedValueOnce({
        data: {
          token: 'jwt-abc-123',
          userId: 1,
          email: 'admin@test.com',
          firstName: 'Admin',
          role: 'ADMIN',
        },
      });

      await authService.login({
        email: 'admin@test.com',
        password: 'tajna123',
      });

      expect(localStorage.getItem('token')).toBe('jwt-abc-123');
      const stored = JSON.parse(localStorage.getItem('currentUser') || '{}');
      expect(stored.role).toBe('ADMIN');
      expect(stored.email).toBe('admin@test.com');
    });

    it('propušta grešku ako backend vrati 401', async () => {
      mockedPost.mockRejectedValueOnce(new Error('Unauthorized'));

      await expect(
        authService.login({
          email: 'admin@test.com',
          password: 'krivasifra',
        }),
      ).rejects.toThrow();

      // Ako login padne, token ne smije biti spremljen
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('logout', () => {
    it('briše token i currentUser iz localStoragea', () => {
      localStorage.setItem('token', 'neki-token');
      localStorage.setItem('currentUser', JSON.stringify({ role: 'ADMIN' }));

      authService.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('currentUser')).toBeNull();
    });
  });

  describe('registerAdmin', () => {
    it('šalje podatke na /voya/api/auth/adminRegister', async () => {
      mockedPost.mockResolvedValueOnce({
        data: { token: 'jwt', userId: 2, role: 'ADMIN' },
      });

      const payload = {
        firstName: 'Marko',
        lastName: 'Marić',
        email: 'marko@test.com',
        phone: '0911234567',
        password: 'tajna123',
      };

      await authService.registerAdmin(payload);

      expect(mockedPost).toHaveBeenCalledWith(
        '/voya/api/auth/adminRegister',
        payload,
      );
    });
  });
});
