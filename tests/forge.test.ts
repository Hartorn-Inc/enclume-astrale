import { describe, it, expect } from 'vitest';
import {
  computeBaseTier,
  computeEffectiveTier,
  computeCeilingPrice,
  computeForgeCraft,
  computeUpgradeCraft,
  computeAmmoCraft,
  ItemCategory,
} from '../src/domain/forge';

describe('computeBaseTier — T(B) = B * (B + 1) / 2', () => {
  it.each([
    [0, 0],
    [1, 1],
    [2, 3],
    [3, 6],
    [4, 10],
  ])('should return T(%i) = %i', (bonus, expectedTier) => {
    expect(computeBaseTier(bonus)).toBe(expectedTier);
  });

  it.each([-1, 5, 2.5, NaN, Infinity])(
    'should throw an error for invalid bonus: %s',
    (invalidBonus) => {
      expect(() => computeBaseTier(invalidBonus)).toThrow();
    }
  );
});

describe('computeEffectiveTier — N = T(B) + S', () => {
  it.each([
    { bonus: 0, slots: 0, expected: 0 },
    { bonus: 1, slots: 0, expected: 1 },
    { bonus: 1, slots: 1, expected: 2 },
    { bonus: 2, slots: 0, expected: 3 },
    { bonus: 2, slots: 2, expected: 5 },
    { bonus: 3, slots: 0, expected: 6 },
    { bonus: 3, slots: 3, expected: 9 },
    { bonus: 4, slots: 0, expected: 10 },
    { bonus: 4, slots: 4, expected: 14 },
  ])(
    'for bonus $bonus and slots $slots, effective tier is $expected',
    ({ bonus, slots, expected }) => {
      expect(computeEffectiveTier(bonus, slots)).toBe(expected);
    }
  );

  it.each([-1, 1.5])('should throw on invalid slots: %s', (invalidSlots) => {
    expect(() => computeEffectiveTier(1, invalidSlots)).toThrow();
  });
});

describe('computeCeilingPrice — P_plafond = Math.round(C * 1000 * N^2)', () => {
  it.each<[ItemCategory, number, number]>([
    ['WEAPON', 0, 0],
    ['WEAPON', 1, 1000],
    ['WEAPON', 2, 4000],
    ['WEAPON', 3, 9000],
    ['WEAPON', 5, 25000],
    ['ARMOR_SHIELD', 1, 850],
    ['ARMOR_SHIELD', 3, 7650],
    ['ARMOR_SHIELD', 6, 30600],
    ['WONDROUS_ITEM', 1, 800],
    ['WONDROUS_ITEM', 2, 3200],
    ['WONDROUS_ITEM', 3, 7200],
  ])('category %s with tier %i should cost %i po', (cat, tier, expectedPrice) => {
    expect(computeCeilingPrice(cat, tier)).toBe(expectedPrice);
  });
});

describe('computeForgeCraft — Golden Test Cases & Capacity Integrity', () => {
  it.each([
    {
      name: 'Arme +1 nue (B=1, S=0) -> 1 000 po',
      request: { category: 'WEAPON' as ItemCategory, bonus: 1, slots: 0 },
      expected: { isValid: true, ceilingPrice: 1000, effectiveTier: 1 },
    },
    {
      name: 'Arme +2 nue (B=2, S=0) -> 9 000 po',
      request: { category: 'WEAPON' as ItemCategory, bonus: 2, slots: 0 },
      expected: { isValid: true, ceilingPrice: 9000, effectiveTier: 3 },
    },
    {
      name: 'Arme +2 avec Sournoise (1) + Frugale (1) (S=2) -> 25 000 po',
      request: {
        category: 'WEAPON' as ItemCategory,
        bonus: 2,
        enchantments: [{ slots: 1 }, { slots: 1 }],
      },
      expected: { isValid: true, ceilingPrice: 25000, effectiveTier: 5 },
    },
    {
      name: 'Armure +1 nue (B=1, S=0) -> 850 po',
      request: { category: 'ARMOR_SHIELD' as ItemCategory, bonus: 1, slots: 0 },
      expected: { isValid: true, ceilingPrice: 850, effectiveTier: 1 },
    },
    {
      name: 'Armure +2 nue (B=2, S=0) -> 7 650 po',
      request: { category: 'ARMOR_SHIELD' as ItemCategory, bonus: 2, slots: 0 },
      expected: { isValid: true, ceilingPrice: 7650, effectiveTier: 3 },
    },
    {
      name: 'Armure +3 nue (B=3, S=0) -> 30 600 po',
      request: { category: 'ARMOR_SHIELD' as ItemCategory, bonus: 3, slots: 0 },
      expected: { isValid: true, ceilingPrice: 30600, effectiveTier: 6 },
    },
    {
      name: 'Objet autonome (Wondrous) avec 2 slots -> 3 200 po',
      request: { category: 'WONDROUS_ITEM' as ItemCategory, bonus: 0, slots: 2 },
      expected: { isValid: true, ceilingPrice: 3200, effectiveTier: 2 },
    },
  ])('$name', ({ request, expected }) => {
    const result = computeForgeCraft(request);
    expect(result.isValid).toBe(expected.isValid);
    if (result.isValid) {
      expect(result.ceilingPrice).toBe(expected.ceilingPrice);
      expect(result.effectiveTier).toBe(expected.effectiveTier);
    }
  });

  it.each([
    {
      name: 'Arme +2 avec S=3 -> rejet CAPACITY_EXCEEDED',
      request: { category: 'WEAPON' as ItemCategory, bonus: 2, slots: 3 },
      expectedError: 'CAPACITY_EXCEEDED',
    },
    {
      name: 'Arme +1 avec S=2 -> rejet CAPACITY_EXCEEDED',
      request: { category: 'WEAPON' as ItemCategory, bonus: 1, slots: 2 },
      expectedError: 'CAPACITY_EXCEEDED',
    },
    {
      name: 'Armure +1 avec S=2 -> rejet CAPACITY_EXCEEDED',
      request: { category: 'ARMOR_SHIELD' as ItemCategory, bonus: 1, slots: 2 },
      expectedError: 'CAPACITY_EXCEEDED',
    },
    {
      name: 'Wondrous Item avec B=1 -> rejet WONDROUS_CANNOT_HAVE_BONUS',
      request: { category: 'WONDROUS_ITEM' as ItemCategory, bonus: 1, slots: 2 },
      expectedError: 'WONDROUS_CANNOT_HAVE_BONUS',
    },
    {
      name: 'Bonus invalide (> 4) -> rejet INVALID_BONUS',
      request: { category: 'WEAPON' as ItemCategory, bonus: 5, slots: 0 },
      expectedError: 'INVALID_BONUS',
    },
  ])('$name', ({ request, expectedError }) => {
    const result = computeForgeCraft(request);
    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.error).toBe(expectedError);
    }
  });
});

describe('computeUpgradeCraft — Améliorations & Golden Test Cases', () => {
  it.each([
    {
      name: 'Armure +2 nue vers +3 nue -> 22 950 po (30 600 - 7 650)',
      request: {
        category: 'ARMOR_SHIELD' as ItemCategory,
        initialBonus: 2,
        initialSlots: 0,
        finalBonus: 3,
        finalSlots: 0,
      },
      expectedCost: 22950,
    },
    {
      name: 'Arme +1 nue vers +2 nue -> 8 000 po (9 000 - 1 000)',
      request: {
        category: 'WEAPON' as ItemCategory,
        initialBonus: 1,
        initialSlots: 0,
        finalBonus: 2,
        finalSlots: 0,
      },
      expectedCost: 8000,
    },
    {
      name: 'Arme +2 nue vers +2 avec 2 slots -> 16 000 po (25 000 - 9 000)',
      request: {
        category: 'WEAPON' as ItemCategory,
        initialBonus: 2,
        initialSlots: 0,
        finalBonus: 2,
        finalSlots: 2,
      },
      expectedCost: 16000,
    },
    {
      name: 'Objet autonome N=1 vers N=3 -> 6 400 po (7 200 - 800)',
      request: {
        category: 'WONDROUS_ITEM' as ItemCategory,
        initialBonus: 0,
        initialSlots: 1,
        finalBonus: 0,
        finalSlots: 3,
      },
      expectedCost: 6400,
    },
  ])('$name', ({ request, expectedCost }) => {
    const result = computeUpgradeCraft(request);
    expect(result.isValid).toBe(true);
    if (result.isValid) {
      expect(result.upgradeCost).toBe(expectedCost);
    }
  });

  it.each([
    {
      name: 'N_final == N_init rejeté',
      request: {
        category: 'WEAPON' as ItemCategory,
        initialBonus: 2,
        finalBonus: 2,
      },
      error: 'INVALID_UPGRADE_TIER',
    },
    {
      name: 'N_final < N_init rejeté',
      request: {
        category: 'WEAPON' as ItemCategory,
        initialBonus: 3,
        finalBonus: 2,
      },
      error: 'INVALID_UPGRADE_TIER',
    },
    {
      name: 'Capacité finale dépassée rejetée',
      request: {
        category: 'WEAPON' as ItemCategory,
        initialBonus: 1,
        initialSlots: 0,
        finalBonus: 2,
        finalSlots: 3,
      },
      error: 'CAPACITY_EXCEEDED',
    },
  ])('$name', ({ request, error }) => {
    const result = computeUpgradeCraft(request);
    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.error).toBe(error);
    }
  });
});

describe('computeAmmoCraft — Munitions & Golden Test Cases', () => {
  it.each([
    {
      name: '10 flèches +1 (B=1, S=0) -> 200 po',
      request: { bonus: 1, quantity: 10 },
      expectedTotal: 200,
      expectedUnitBase: 20,
    },
    {
      name: '10 flèches +2 (B=2, S=0) -> 1 800 po',
      request: { bonus: 2, quantity: 10 },
      expectedTotal: 1800,
      expectedUnitBase: 180,
    },
    {
      name: '10 flèches +1 avec Argentée (+10 po/unité) -> 300 po',
      request: {
        bonus: 1,
        quantity: 10,
        supplements: ['SILVERED' as const],
      },
      expectedTotal: 300,
      expectedUnitBase: 20,
    },
    {
      name: '20 flèches +1 avec Incassable (+20) et Percutante (+20) -> 1 200 po',
      request: {
        bonus: 1,
        quantity: 20,
        supplements: ['UNBREAKABLE' as const, 'PIERCING' as const],
      },
      expectedTotal: 1200,
      expectedUnitBase: 20,
    },
  ])('$name', ({ request, expectedTotal, expectedUnitBase }) => {
    const result = computeAmmoCraft(request);
    expect(result.isValid).toBe(true);
    if (result.isValid) {
      expect(result.totalCeilingPrice).toBe(expectedTotal);
      expect(result.unitBasePrice).toBe(expectedUnitBase);
    }
  });

  it.each([
    {
      name: 'Quantité nulle -> INVALID_QUANTITY',
      request: { bonus: 1, quantity: 0 },
      error: 'INVALID_QUANTITY',
    },
    {
      name: 'Quantité négative -> INVALID_QUANTITY',
      request: { bonus: 1, quantity: -5 },
      error: 'INVALID_QUANTITY',
    },
    {
      name: 'Capacité de munitions dépassée S > B',
      request: { bonus: 1, slots: 2, quantity: 10 },
      error: 'CAPACITY_EXCEEDED',
    },
    {
      name: 'Bonus invalide',
      request: { bonus: 6, quantity: 10 },
      error: 'INVALID_BONUS',
    },
  ])('$name', ({ request, error }) => {
    const result = computeAmmoCraft(request);
    expect(result.isValid).toBe(false);
    if (!result.isValid) {
      expect(result.error).toBe(error);
    }
  });
});
