import { describe, it, expect } from 'vitest';
import {
  simulateMarket,
  resolveMarketOutcome,
  rollD20,
  type MarketOutcomeCategory,
  type ComplicationSeverity,
} from '../src/domain/market';

describe('Moteur de marché d20 — Golden Test Cases (CDC)', () => {
  it.each([
    {
      name: 'd20 = 1 sur 22 950 po (72 %, remise maximale de 28 %, aucun incident)',
      basePrice: 22950,
      d20Roll: 1,
      expectedPrice: 16524,
      expectedRatio: 0.72,
      expectedHasComplication: false,
      expectedSeverity: 'NONE' as ComplicationSeverity,
    },
    {
      name: 'd20 = 3 sur 22 950 po (76 %, remise de 24 %, aucun incident)',
      basePrice: 22950,
      d20Roll: 3,
      expectedPrice: 17442,
      expectedRatio: 0.76,
      expectedHasComplication: false,
      expectedSeverity: 'NONE' as ComplicationSeverity,
    },
    {
      name: 'd20 = 15 sur 25 000 po (100 %, prix plafond nominal sans incident)',
      basePrice: 25000,
      d20Roll: 15,
      expectedPrice: 25000,
      expectedRatio: 1.0,
      expectedHasComplication: false,
      expectedSeverity: 'NONE' as ComplicationSeverity,
    },
    {
      name: "d20 = 18 sur 25 000 po (100 %, incident d'atelier)",
      basePrice: 25000,
      d20Roll: 18,
      expectedPrice: 25000,
      expectedRatio: 1.0,
      expectedHasComplication: true,
      expectedSeverity: 'WORKSHOP_INCIDENT' as ComplicationSeverity,
    },
  ])('$name', ({ basePrice, d20Roll, expectedPrice, expectedRatio, expectedHasComplication, expectedSeverity }) => {
    const result = simulateMarket(basePrice, d20Roll);
    expect(result.finalPrice).toBe(expectedPrice);
    expect(result.priceRatio).toBe(expectedRatio);
    expect(result.complication.hasComplication).toBe(expectedHasComplication);
    expect(result.complication.severity).toBe(expectedSeverity);
    expect(result.finalPrice).toBeLessThanOrEqual(basePrice);
  });
});

describe('Moteur de marché d20 — Grille complète des tirages d20 (1 à 20)', () => {
  it.each<[
    number,
    number,
    MarketOutcomeCategory,
    boolean,
    ComplicationSeverity,
    string
  ]>([
    [1, 0.72, 'EXCEPTIONAL_OPPORTUNITY', false, 'NONE', 'Opportunité exceptionnelle'],
    [2, 0.74, 'VERY_ADVANTAGEOUS', false, 'NONE', 'Affaire très avantageuse'],
    [3, 0.76, 'VERY_ADVANTAGEOUS', false, 'NONE', 'Affaire très avantageuse'],
    [4, 0.78, 'VERY_ADVANTAGEOUS', false, 'NONE', 'Affaire très avantageuse'],
    [5, 0.80, 'VERY_ADVANTAGEOUS', false, 'NONE', 'Affaire très avantageuse'],
    [6, 0.82, 'FAVORABLE_MARKET', false, 'NONE', 'Marché favorable'],
    [7, 0.84, 'FAVORABLE_MARKET', false, 'NONE', 'Marché favorable'],
    [8, 0.86, 'FAVORABLE_MARKET', false, 'NONE', 'Marché favorable'],
    [9, 0.88, 'FAVORABLE_MARKET', false, 'NONE', 'Marché favorable'],
    [10, 0.90, 'FAVORABLE_MARKET', false, 'NONE', 'Marché favorable'],
    [11, 0.92, 'STANDARD_RATE', false, 'NONE', 'Prix du cours habituel'],
    [12, 0.94, 'STANDARD_RATE', false, 'NONE', 'Prix du cours habituel'],
    [13, 0.96, 'STANDARD_RATE', false, 'NONE', 'Prix du cours habituel'],
    [14, 0.98, 'STANDARD_RATE', false, 'NONE', 'Prix du cours habituel'],
    [15, 1.00, 'NOMINAL_CEILING', false, 'NONE', 'Prix plafond nominal'],
    [16, 1.00, 'MINOR_COMPLICATION', true, 'MINOR', 'Complication mineure'],
    [17, 1.00, 'MINOR_COMPLICATION', true, 'MINOR', 'Complication mineure'],
    [18, 1.00, 'WORKSHOP_INCIDENT', true, 'WORKSHOP_INCIDENT', "Incident d'atelier"],
    [19, 1.00, 'WORKSHOP_INCIDENT', true, 'WORKSHOP_INCIDENT', "Incident d'atelier"],
    [20, 1.00, 'MAJOR_COMPLICATION', true, 'MAJOR', 'Complication majeure'],
  ])(
    'd20 = %i => ratio %f, catégorie %s, complication = %s (sévérité: %s, label: %s)',
    (d20, expectedRatio, category, hasComplication, severity, categoryLabel) => {
      const outcome = resolveMarketOutcome(d20);
      expect(outcome.category).toBe(category);
      expect(outcome.categoryLabel).toBe(categoryLabel);
      expect(outcome.complication.hasComplication).toBe(hasComplication);
      expect(outcome.complication.severity).toBe(severity);

      const basePrice = 10000;
      const simulation = simulateMarket(basePrice, d20);
      expect(simulation.priceRatio).toBe(expectedRatio);
      expect(simulation.category).toBe(category);
      expect(simulation.complication.hasComplication).toBe(hasComplication);
      expect(simulation.complication.severity).toBe(severity);
      expect(simulation.finalPrice).toBe(Math.round(basePrice * expectedRatio));
      expect(simulation.finalPrice).toBeLessThanOrEqual(basePrice);
    }
  );
});

describe('Moteur de marché d20 — Règle du Prix Plafond Garanti (P_payé <= P_plafond)', () => {
  it.each([
    0,
    100,
    800,
    1000,
    7650,
    9000,
    22950,
    25000,
    30600,
    100000,
  ])('pour un prix de base de %i po, finalPrice <= basePrice sur tous les tirages d20 (1 à 20)', (basePrice) => {
    for (let roll = 1; roll <= 20; roll++) {
      const sim = simulateMarket(basePrice, roll);
      expect(sim.finalPrice).toBeLessThanOrEqual(basePrice);
      expect(sim.finalPrice).toBeGreaterThanOrEqual(0);
      expect(sim.savedAmount).toBe(basePrice - sim.finalPrice);
    }
  });
});

describe('Moteur de marché d20 — Gestion des erreurs et valeurs hors limites', () => {
  it.each([
    -1,
    0,
    21,
    25,
    3.5,
    NaN,
    Infinity,
    -Infinity,
  ])('rejette le d20 invalide %s avec RangeError', (invalidRoll) => {
    expect(() => simulateMarket(1000, invalidRoll)).toThrow(RangeError);
    expect(() => resolveMarketOutcome(invalidRoll)).toThrow(RangeError);
  });

  it.each([
    -1,
    -100,
    NaN,
    Infinity,
    -Infinity,
  ])('rejette le basePrice invalide %s avec RangeError', (invalidBasePrice) => {
    expect(() => simulateMarket(invalidBasePrice, 10)).toThrow(RangeError);
  });
});

describe('rollD20 — Générateur aléatoire', () => {
  it('génère des entiers valides entre 1 et 20', () => {
    for (let i = 0; i < 50; i++) {
      const roll = rollD20();
      expect(Number.isInteger(roll)).toBe(true);
      expect(roll).toBeGreaterThanOrEqual(1);
      expect(roll).toBeLessThanOrEqual(20);
    }
  });
});
