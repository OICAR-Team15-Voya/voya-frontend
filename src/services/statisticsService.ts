import { api } from '../lib/api';
import type { StatisticsDto } from '../types';

/**
 * Dohvat statistika za dashboard
 * Vrijeme:
 *  -undefined - sve vremena
 *  -days: 7/14/30 - zadnjih N dana
 *  -from/to - custom interval (ISO datetime)
 */
interface StatisticsQuery {
  days?: number;
  from?: string;
  to?: string;
}

export const statisticsService = {
  get: async (query: StatisticsQuery = {}): Promise<StatisticsDto> => {
    const response = await api.get<StatisticsDto>('/voya/api/statistics', {
      params: query,
    });
    return response.data;
  },
};