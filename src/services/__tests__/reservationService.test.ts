import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reservationService } from '../reservationService';
import { api } from '../../lib/api';

vi.mock('../../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockedGet = vi.mocked(api.get);
const mockedPost = vi.mocked(api.post);
const mockedPut = vi.mocked(api.put);
const mockedDelete = vi.mocked(api.delete);

describe('reservationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAll dohvaća sve rezervacije', async () => {
    mockedGet.mockResolvedValueOnce({
      data: [
        { id: 1, status: 'CONFIRMED', price: 100 },
        { id: 2, status: 'COMPLETED', price: 200 },
      ],
    });

    const reservations = await reservationService.getAll();

    expect(mockedGet).toHaveBeenCalled();
    expect(reservations).toHaveLength(2);
  });

  it('create šalje POST s payloadom rezervacije', async () => {
    const payload = {
      userId: 1,
      time: '2026-12-15T13:30:00',
      pickupLocation: 'Aerodrom',
      dropoffLocation: 'Hotel Esplanade',
      passengerNumber: 2,
      luggageNumber: 3,
      vehicleCategoryId: 1,
    };
    mockedPost.mockResolvedValueOnce({ data: { id: 99, ...payload } });

    const result = await reservationService.create(payload as never);

    expect(mockedPost).toHaveBeenCalled();
    expect(result.id).toBe(99);
  });

  it('update šalje PUT s ID-em', async () => {
    mockedPut.mockResolvedValueOnce({ data: {} });

    await reservationService.update(5, {
      pickupLocation: 'Nova lokacija',
    } as never);

    expect(mockedPut).toHaveBeenCalled();
    const [url] = mockedPut.mock.calls[0];
    expect(url).toContain('/5');
  });

  it('delete šalje DELETE zahtjev', async () => {
    mockedDelete.mockResolvedValueOnce({ data: {} });

    await reservationService.delete(10);

    expect(mockedDelete).toHaveBeenCalled();
    const [url] = mockedDelete.mock.calls[0];
    expect(url).toContain('/10');
  });
});
