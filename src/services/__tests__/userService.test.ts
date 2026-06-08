import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userService } from '../userService';
import { api } from '../../lib/api';

vi.mock('../../lib/api', () => ({
  api: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedGet = vi.mocked(api.get);
const mockedPut = vi.mocked(api.put);

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAll dohvaća sve korisnike s /voya/api/users/all', async () => {
    mockedGet.mockResolvedValueOnce({
      data: [
        { id: 1, email: 'a@test.com', role: 'ADMIN', status: true },
        { id: 2, email: 'b@test.com', role: 'CLIENT', status: true },
      ],
    });

    const users = await userService.getAll();

    expect(mockedGet).toHaveBeenCalledWith('/voya/api/users/all');
    expect(users).toHaveLength(2);
    expect(users[0].role).toBe('ADMIN');
  });

  it('getById dohvaća korisnika po ID-u', async () => {
    mockedGet.mockResolvedValueOnce({
      data: { id: 5, email: 'admin@test.com', role: 'ADMIN' },
    });

    const user = await userService.getById(5);

    expect(mockedGet).toHaveBeenCalledWith('/voya/api/users/5');
    expect(user.id).toBe(5);
  });

  it('updatePassword šalje oldPassword i newPassword na ispravan endpoint', async () => {
    mockedPut.mockResolvedValueOnce({ data: {} });

    await userService.updatePassword(7, {
      oldPassword: 'stara123',
      newPassword: 'nova456',
    });

    expect(mockedPut).toHaveBeenCalledWith('/voya/api/users/7/password', {
      oldPassword: 'stara123',
      newPassword: 'nova456',
    });
  });

  it('deactivate šalje PUT na /voya/api/users/{id}/deactivate', async () => {
    mockedPut.mockResolvedValueOnce({ data: {} });

    await userService.deactivate(3);

    expect(mockedPut).toHaveBeenCalledWith('/voya/api/users/3/deactivate');
  });
});
