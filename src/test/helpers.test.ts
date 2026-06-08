import { describe, it, expect } from 'vitest';

/**
 * Helper funkcije iz HomePage.tsx — kopirane ovdje za jedinično testiranje.
 * Ako se logika promijeni u HomePage, treba ažurirati i ove testove.
 */

function topN<T extends { count: number }>(items: T[], n = 5): T[] {
  return [...items].sort((a, b) => b.count - a.count).slice(0, n);
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat('hr-HR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

describe('topN helper', () => {
  it('sortira po countu silazno', () => {
    const items = [
      { name: 'A', count: 1 },
      { name: 'B', count: 5 },
      { name: 'C', count: 3 },
    ];
    const result = topN(items);
    expect(result[0].name).toBe('B');
    expect(result[1].name).toBe('C');
    expect(result[2].name).toBe('A');
  });

  it('vraća maksimalno N elemenata', () => {
    const items = Array.from({ length: 10 }, (_, i) => ({
      name: `Item${i}`,
      count: i,
    }));
    expect(topN(items, 3)).toHaveLength(3);
    expect(topN(items, 5)).toHaveLength(5);
  });

  it('ne mutira originalni niz', () => {
    const items = [
      { count: 1 },
      { count: 3 },
      { count: 2 },
    ];
    const original = [...items];
    topN(items);
    expect(items).toEqual(original);
  });

  it('vraća prazan niz za prazan input', () => {
    expect(topN([])).toEqual([]);
  });
});

describe('formatNumber helper', () => {
  it('formatira broj s dva decimalna mjesta', () => {
    const result = formatNumber(1234.5);
    // hr-HR koristi zarez kao decimalni separator
    expect(result).toMatch(/1\.234,50|1234,50/);
  });

  it('uvijek prikazuje dvije decimale čak i za cijele brojeve', () => {
    const result = formatNumber(100);
    expect(result).toMatch(/100,00/);
  });

  it('formatira nulu kao 0,00', () => {
    expect(formatNumber(0)).toMatch(/0,00/);
  });
});
