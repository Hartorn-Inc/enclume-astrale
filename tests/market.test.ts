import { describe, it, expect } from 'vitest';
import { simulateMarketD20 } from '../src/domain/market';

describe('Simulateur de Marché d20 — Formule et Plafond Garanti', () => {
  it('d20=1 sur 22 950 po donne 16 524 po (72 %, remise 28 %)', () => {
    const res = simulateMarketD20(22950, 1);
    expect(res.finalPrice).toBe(16524);
    expect(res.priceRatio).toBe(0.72);
    expect(res.discountRate).toBe(0.28);
    expect(res.category).toBe('exceptional_deal');
    expect(res.complicationTitle).toBeNull();
  });

  it('d20=3 sur 22 950 po donne 17 442 po (76 %, remise 24 %)', () => {
    const res = simulateMarketD20(22950, 3);
    expect(res.finalPrice).toBe(17442);
    expect(res.priceRatio).toBe(0.76);
    expect(res.discountRate).toBe(0.24);
    expect(res.category).toBe('very_advantageous');
  });

  it('d20=15 sur 25 000 po donne 25 000 po (100 %, aucun incident)', () => {
    const res = simulateMarketD20(25000, 15);
    expect(res.finalPrice).toBe(25000);
    expect(res.priceRatio).toBe(1.0);
    expect(res.discountRate).toBe(0);
    expect(res.category).toBe('nominal_ceiling');
    expect(res.complicationTitle).toBeNull();
  });

  it('d20=18 sur 25 000 po donne 25 000 po (100 %, incident d atelier)', () => {
    const res = simulateMarketD20(25000, 18);
    expect(res.finalPrice).toBe(25000);
    expect(res.category).toBe('workshop_incident');
    expect(res.complicationTitle).not.toBeNull();
    expect(res.complicationDescription).toContain('instabilité du creuset');
  });

  it.each([
    [1, 0.72, 720, 'exceptional_deal', false],
    [2, 0.74, 740, 'very_advantageous', false],
    [3, 0.76, 760, 'very_advantageous', false],
    [4, 0.78, 780, 'very_advantageous', false],
    [5, 0.80, 800, 'very_advantageous', false],
    [6, 0.82, 820, 'favorable_market', false],
    [7, 0.84, 840, 'favorable_market', false],
    [8, 0.86, 860, 'favorable_market', false],
    [9, 0.88, 880, 'favorable_market', false],
    [10, 0.90, 900, 'favorable_market', false],
    [11, 0.92, 920, 'standard_market', false],
    [12, 0.94, 940, 'standard_market', false],
    [13, 0.96, 960, 'standard_market', false],
    [14, 0.98, 980, 'standard_market', false],
    [15, 1.00, 1000, 'nominal_ceiling', false],
    [16, 1.00, 1000, 'minor_complication', true],
    [17, 1.00, 1000, 'minor_complication', true],
    [18, 1.00, 1000, 'workshop_incident', true],
    [19, 1.00, 1000, 'workshop_incident', true],
    [20, 1.00, 1000, 'major_complication', true],
  ])(
    'tirage d20=%i sur plafond 1000 po : ratio=%f, finalPrice=%i po, categorie=%s, hasComplication=%s',
    (d20, expectedRatio, expectedPrice, expectedCategory, hasComplication) => {
      const res = simulateMarketD20(1000, d20);
      expect(res.priceRatio).toBeCloseTo(expectedRatio, 2);
      expect(res.finalPrice).toBe(expectedPrice);
      expect(res.category).toBe(expectedCategory);
      if (hasComplication) {
        expect(res.complicationTitle).toBeTruthy();
      } else {
        expect(res.complicationTitle).toBeNull();
      }
      expect(res.finalPrice).toBeLessThanOrEqual(1000);
    }
  );

  it('rejette les valeurs hors bornes [1, 20]', () => {
    expect(() => simulateMarketD20(1000, 0)).toThrow();
    expect(() => simulateMarketD20(1000, 21)).toThrow();
    expect(() => simulateMarketD20(1000, 3.5)).toThrow();
  });
});
