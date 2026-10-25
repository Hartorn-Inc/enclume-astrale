import { describe, it, expect } from 'vitest';
import {
  computeBaseTier,
  computeEffectiveTier,
  computeForgeQuote,
  computeUpgrade,
  computeAmmoQuote,
  ItemCategory,
  AmmoSupplement,
} from '../src/domain/forge';

describe('computeBaseTier', () => {
  it.each([
    { bonus: 0, expected: 0 },
    { bonus: 1, expected: 1 },
    { bonus: 2, expected: 3 },
    { bonus: 3, expected: 6 },
    { bonus: 4, expected: 10 },
  ])('should calculate T($bonus) = $expected', ({ bonus, expected }) => {
    expect(computeBaseTier(bonus)).toBe(expected);
  });

  it.each([-1, -5, 1.5, NaN])('should throw on invalid bonus: %s', (invalidBonus) => {
    expect(() => computeBaseTier(invalidBonus)).toThrow();
  });
});

describe('computeEffectiveTier', () => {
  it.each([
    { bonus: 0, slots: 0, expected: 0 },
    { bonus: 1, slots: 0, expected: 1 },
    { bonus: 1, slots: 1, expected: 2 },
    { bonus: 2, slots: 0, expected: 3 },
    { bonus: 2, slots: 2, expected: 5 },
    { bonus: 3, slots: 3, expected: 9 },
    { bonus: 4, slots: 1, expected: 11 },
  ])('should compute N = T($bonus) + $slots = $expected', ({ bonus, slots, expected }) => {
    expect(computeEffectiveTier(bonus, slots)).toBe(expected);
  });

  it.each([
    { bonus: 1, slots: -1 },
    { bonus: 1, slots: 1.5 },
  ])('should throw on invalid slots: %o', ({ bonus, slots }) => {
    expect(() => computeEffectiveTier(bonus, slots)).toThrow();
  });
});

describe('computeForgeQuote - Capacity integrity rule & golden cases', () => {
  it.each([
    {
      description: 'Arme +1 nue (B=1, S=0) -> 1000 po',
      category: 'WEAPON' as ItemCategory,
      enhancementBonus: 1,
      slots: 0,
      expectedTier: 1,
      expectedPrice: 1000,
    },
    {
      description: 'Arme +2 nue (B=2, S=0) -> 9000 po',
      category: 'WEAPON' as ItemCategory,
      enhancementBonus: 2,
      slots: 0,
      expectedTier: 3,
      expectedPrice: 9000,
    },
    {
      description: 'Arme +2 avec Sournoise (1) + Frugale (1) => S=2 -> 25000 po',
      category: 'WEAPON' as ItemCategory,
      enhancementBonus: 2,
      slots: 2,
      expectedTier: 5,
      expectedPrice: 25000,
    },
    {
      description: 'Armure +2 nue (B=2, S=0) -> 0.85 * 9000 = 7650 po',
      category: 'ARMOR_SHIELD' as ItemCategory,
      enhancementBonus: 2,
      slots: 0,
      expectedTier: 3,
      expectedPrice: 7650,
    },
    {
      description: 'Armure +3 nue (B=3, S=0) -> 0.85 * 36000 = 30600 po',
      category: 'ARMOR_SHIELD' as ItemCategory,
      enhancementBonus: 3,
      slots: 0,
      expectedTier: 6,
      expectedPrice: 30600,
    },
    {
      description: 'Objet merveilleux autonome (B=0, S=3) -> 0.80 * 1000 * 9 = 7200 po',
      category: 'WONDROUS_ITEM' as ItemCategory,
      enhancementBonus: 0,
      slots: 3,
      expectedTier: 3,
      expectedPrice: 7200,
    },
  ])('$description', ({ category, enhancementBonus, slots, expectedTier, expectedPrice }) => {
    const quote = computeForgeQuote({ category, enhancementBonus, slots });
    expect(quote.isValid).toBe(true);
    expect(quote.effectiveTier).toBe(expectedTier);
    expect(quote.ceilingPrice).toBe(expectedPrice);
  });

  it.each([
    {
      description: 'Arme +2 avec 3 slots (S > B) -> CAPACITY_EXCEEDED',
      category: 'WEAPON' as ItemCategory,
      enhancementBonus: 2,
      slots: 3,
      expectedError: 'CAPACITY_EXCEEDED',
    },
    {
      description: 'Armure +1 avec 2 slots (S > B) -> CAPACITY_EXCEEDED',
      category: 'ARMOR_SHIELD' as ItemCategory,
      enhancementBonus: 1,
      slots: 2,
      expectedError: 'CAPACITY_EXCEEDED',
    },
    {
      description: 'Objet autonome avec B > 0 -> WONDROUS_ITEM_CANNOT_HAVE_BONUS',
      category: 'WONDROUS_ITEM' as ItemCategory,
      enhancementBonus: 1,
      slots: 0,
      expectedError: 'WONDROUS_ITEM_CANNOT_HAVE_BONUS',
    },
  ])('$description', ({ category, enhancementBonus, slots, expectedError }) => {
    const quote = computeForgeQuote({ category, enhancementBonus, slots });
    expect(quote.isValid).toBe(false);
    expect(quote.error).toBe(expectedError);
  });
});

describe('computeUpgrade', () => {
  it.each([
    {
      description: 'Armure +2 nue vers +3 nue: 0.85 * (36000 - 9000) = 22950 po',
      category: 'ARMOR_SHIELD' as ItemCategory,
      initialEnhancementBonus: 2,
      initialSlots: 0,
      finalEnhancementBonus: 3,
      finalSlots: 0,
      expectedUpgradePrice: 22950,
      expectedInitialPrice: 7650,
      expectedFinalPrice: 30600,
    },
    {
      description: 'Arme +1 nue (1000 po) vers +2 nue (9000 po) -> 8000 po',
      category: 'WEAPON' as ItemCategory,
      initialEnhancementBonus: 1,
      initialSlots: 0,
      finalEnhancementBonus: 2,
      finalSlots: 0,
      expectedUpgradePrice: 8000,
      expectedInitialPrice: 1000,
      expectedFinalPrice: 9000,
    },
    {
      description: 'Arme +2 nue (9000 po) vers Arme +2 avec 2 slots (25000 po) -> 16000 po',
      category: 'WEAPON' as ItemCategory,
      initialEnhancementBonus: 2,
      initialSlots: 0,
      finalEnhancementBonus: 2,
      finalSlots: 2,
      expectedUpgradePrice: 16000,
      expectedInitialPrice: 9000,
      expectedFinalPrice: 25000,
    },
  ])('$description', ({
    category,
    initialEnhancementBonus,
    initialSlots,
    finalEnhancementBonus,
    finalSlots,
    expectedUpgradePrice,
    expectedInitialPrice,
    expectedFinalPrice,
  }) => {
    const res = computeUpgrade({
      category,
      initialEnhancementBonus,
      initialSlots,
      finalEnhancementBonus,
      finalSlots,
    });
    expect(res.isValid).toBe(true);
    expect(res.initialCeilingPrice).toBe(expectedInitialPrice);
    expect(res.finalCeilingPrice).toBe(expectedFinalPrice);
    expect(res.upgradePrice).toBe(expectedUpgradePrice);
  });

  it.each([
    {
      description: 'Rejet si N_final <= N_init (même niveau)',
      category: 'WEAPON' as ItemCategory,
      initialEnhancementBonus: 2,
      initialSlots: 0,
      finalEnhancementBonus: 2,
      finalSlots: 0,
      expectedError: 'FINAL_TIER_NOT_GREATER',
    },
    {
      description: 'Rejet si N_final < N_init (rétrogradation)',
      category: 'WEAPON' as ItemCategory,
      initialEnhancementBonus: 2,
      initialSlots: 1,
      finalEnhancementBonus: 2,
      finalSlots: 0,
      expectedError: 'FINAL_TIER_NOT_GREATER',
    },
    {
      description: 'Rejet si objet final dépasse la capacité (S > B)',
      category: 'WEAPON' as ItemCategory,
      initialEnhancementBonus: 1,
      initialSlots: 0,
      finalEnhancementBonus: 1,
      finalSlots: 2,
      expectedError: 'CAPACITY_EXCEEDED',
    },
  ])('$description', ({
    category,
    initialEnhancementBonus,
    initialSlots,
    finalEnhancementBonus,
    finalSlots,
    expectedError,
  }) => {
    const res = computeUpgrade({
      category,
      initialEnhancementBonus,
      initialSlots,
      finalEnhancementBonus,
      finalSlots,
    });
    expect(res.isValid).toBe(false);
    expect(res.error).toBe(expectedError);
  });
});

describe('computeAmmoQuote', () => {
  it.each([
    {
      description: '10 flèches +1 (N=1, Q=10) -> (1000 / 50) * 10 = 200 po',
      enhancementBonus: 1,
      slots: 0,
      quantity: 10,
      supplements: [] as AmmoSupplement[],
      expectedPrice: 200,
      expectedTier: 1,
    },
    {
      description: '10 flèches +2 (N=3, Q=10) -> (9000 / 50) * 10 = 1800 po',
      enhancementBonus: 2,
      slots: 0,
      quantity: 10,
      supplements: [] as AmmoSupplement[],
      expectedPrice: 1800,
      expectedTier: 3,
    },
    {
      description: '50 flèches +1 (N=1, Q=50) -> 1000 po',
      enhancementBonus: 1,
      slots: 0,
      quantity: 50,
      supplements: [] as AmmoSupplement[],
      expectedPrice: 1000,
      expectedTier: 1,
    },
    {
      description: '10 flèches +1 avec Incassable (+20 po/u) -> 200 + 200 = 400 po',
      enhancementBonus: 1,
      slots: 0,
      quantity: 10,
      supplements: ['INCASSABLE'] as AmmoSupplement[],
      expectedPrice: 400,
      expectedTier: 1,
    },
    {
      description: '10 flèches +1 avec Percutante (+20) et Argentée (+10) -> 200 + 300 = 500 po',
      enhancementBonus: 1,
      slots: 0,
      quantity: 10,
      supplements: ['PERCUTANTE', 'ARGENTEE'] as AmmoSupplement[],
      expectedPrice: 500,
      expectedTier: 1,
    },
  ])('$description', ({
    enhancementBonus,
    slots,
    quantity,
    supplements,
    expectedPrice,
    expectedTier,
  }) => {
    const res = computeAmmoQuote({ enhancementBonus, slots, quantity, supplements });
    expect(res.isValid).toBe(true);
    expect(res.effectiveTier).toBe(expectedTier);
    expect(res.ceilingPrice).toBe(expectedPrice);
  });

  it.each([
    {
      description: 'Rejet si capacité munitions dépassée (S > B)',
      enhancementBonus: 1,
      slots: 2,
      quantity: 10,
      expectedError: 'CAPACITY_EXCEEDED',
    },
    {
      description: 'Rejet si quantité <= 0',
      enhancementBonus: 1,
      slots: 0,
      quantity: 0,
      expectedError: 'INVALID_QUANTITY',
    },
    {
      description: 'Rejet si bonus négatif',
      enhancementBonus: -1,
      slots: 0,
      quantity: 10,
      expectedError: 'INVALID_BONUS',
    },
  ])('$description', ({
    enhancementBonus,
    slots,
    quantity,
    expectedError,
  }) => {
    const res = computeAmmoQuote({ enhancementBonus, slots, quantity });
    expect(res.isValid).toBe(false);
    expect(res.error).toBe(expectedError);
  });
});
