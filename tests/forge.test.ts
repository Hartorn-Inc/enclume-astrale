import { describe, it, expect } from 'vitest';
import {
  computeBaseTier,
  computeEffectiveTier,
  computeTierPrice,
  calculateForgeCraft,
  calculateUpgrade,
  calculateAmmoCraft,
  ItemCategory,
} from '../src/domain/forge';

describe('computeBaseTier', () => {
  it.each([
    [0, 0],
    [1, 1],
    [2, 3],
    [3, 6],
    [4, 10],
  ])('should compute T(%i) = %i according to the formula B * (B + 1) / 2', (bonus, expectedTier) => {
    expect(computeBaseTier(bonus)).toBe(expectedTier);
  });

  it.each([-1, 5, 2.5, NaN])('should throw an error for invalid alteration bonus %s', (invalidBonus) => {
    expect(() => computeBaseTier(invalidBonus)).toThrow();
  });
});

describe('computeEffectiveTier', () => {
  it.each([
    { b: 0, s: 0, expected: 0 },
    { b: 1, s: 0, expected: 1 },
    { b: 1, s: 1, expected: 2 },
    { b: 2, s: 0, expected: 3 },
    { b: 2, s: 2, expected: 5 },
    { b: 3, s: 1, expected: 7 },
    { b: 4, s: 4, expected: 14 },
  ])('should calculate N = T($b) + $s = $expected', ({ b, s, expected }) => {
    expect(computeEffectiveTier(b, s)).toBe(expected);
  });

  it.each([-1, -4, 1.5])('should throw an error for invalid slot cost %s', (invalidSlot) => {
    expect(() => computeEffectiveTier(1, invalidSlot)).toThrow();
  });
});

describe('computeTierPrice', () => {
  it.each<[ItemCategory, number, number]>([
    ['WEAPON', 1, 1000],
    ['WEAPON', 3, 9000],
    ['WEAPON', 5, 25000],
    ['ARMOR_SHIELD', 3, 7650], // 0.85 * 9000 = 7650
    ['ARMOR_SHIELD', 6, 30600], // 0.85 * 36000 = 30600
    ['WONDROUS_ITEM', 1, 800], // 0.80 * 1000 = 800
    ['WONDROUS_ITEM', 2, 3200], // 0.80 * 4000 = 3200
  ])('should compute price ceiling for category %s at tier %i -> %i po', (category, tier, expectedPrice) => {
    expect(computeTierPrice(category, tier)).toBe(expectedPrice);
  });
});

describe('calculateForgeCraft - CDC Golden Test Cases & Capacity Integrity', () => {
  it('Arme +1 nue = 1 000 po (B=1, S=0, N=1)', () => {
    const res = calculateForgeCraft({
      category: 'WEAPON',
      alterationBonus: 1,
      slotsCost: 0,
    });
    expect(res).toEqual({
      isValid: true,
      category: 'WEAPON',
      alterationBonus: 1,
      slotsCost: 0,
      effectiveTier: 1,
      pricePlafond: 1000,
    });
  });

  it('Arme +2 nue = 9 000 po (B=2, S=0, N=3)', () => {
    const res = calculateForgeCraft({
      category: 'WEAPON',
      alterationBonus: 2,
      slotsCost: 0,
    });
    expect(res).toEqual({
      isValid: true,
      category: 'WEAPON',
      alterationBonus: 2,
      slotsCost: 0,
      effectiveTier: 3,
      pricePlafond: 9000,
    });
  });

  it('Arme +2 avec Sournoise (1) + Frugale (1) = 25 000 po (B=2, S=2, N=5)', () => {
    const res = calculateForgeCraft({
      category: 'WEAPON',
      alterationBonus: 2,
      enchantments: [
        { id: 'sneak', name: 'Sournoise', slotCost: 1 },
        { id: 'thrifty', name: 'Frugale', slotCost: 1 },
      ],
    });
    expect(res).toEqual({
      isValid: true,
      category: 'WEAPON',
      alterationBonus: 2,
      slotsCost: 2,
      effectiveTier: 5,
      pricePlafond: 25000,
    });
  });

  it('Arme +2 avec 3 slots = INVALID (CAPACITY_EXCEEDED)', () => {
    const res = calculateForgeCraft({
      category: 'WEAPON',
      alterationBonus: 2,
      slotsCost: 3,
    });
    expect(res.isValid).toBe(false);
    if (!res.isValid) {
      expect(res.error).toBe('CAPACITY_EXCEEDED');
    }
  });

  it('Armure +1 avec 2 slots = INVALID (CAPACITY_EXCEEDED)', () => {
    const res = calculateForgeCraft({
      category: 'ARMOR_SHIELD',
      alterationBonus: 1,
      slotsCost: 2,
    });
    expect(res.isValid).toBe(false);
    if (!res.isValid) {
      expect(res.error).toBe('CAPACITY_EXCEEDED');
    }
  });

  it.each([
    { category: 'WEAPON' as const, bonus: 5, slots: 0, error: 'INVALID_ALTERATION_BONUS' },
    { category: 'ARMOR_SHIELD' as const, bonus: -1, slots: 0, error: 'INVALID_ALTERATION_BONUS' },
    { category: 'WEAPON' as const, bonus: 2, slots: -1, error: 'INVALID_SLOTS_COST' },
    { category: 'WONDROUS_ITEM' as const, bonus: 1, slots: 0, error: 'WONDROUS_ITEM_BONUS_NOT_ALLOWED' },
  ])('should reject invalid craft parameters: %j', ({ category, bonus, slots, error }) => {
    const res = calculateForgeCraft({
      category,
      alterationBonus: bonus,
      slotsCost: slots,
    });
    expect(res.isValid).toBe(false);
    if (!res.isValid) {
      expect(res.error).toBe(error);
    }
  });

  it('Wondrous item should enforce B=0 and N=S', () => {
    const res = calculateForgeCraft({
      category: 'WONDROUS_ITEM',
      alterationBonus: 0,
      slotsCost: 3,
    });
    expect(res).toEqual({
      isValid: true,
      category: 'WONDROUS_ITEM',
      alterationBonus: 0,
      slotsCost: 3,
      effectiveTier: 3,
      pricePlafond: 7200, // 0.8 * 1000 * 9 = 7200
    });
  });
});

describe('calculateUpgrade - CDC Golden Test Cases', () => {
  it('Armure +2 nue (N=3) vers +3 nue (N=6) = 22 950 po', () => {
    const res = calculateUpgrade({
      category: 'ARMOR_SHIELD',
      initialTier: 3,
      finalTier: 6,
    });
    expect(res).toEqual({
      isValid: true,
      category: 'ARMOR_SHIELD',
      initialTier: 3,
      finalTier: 6,
      initialPrice: 7650,
      finalPrice: 30600,
      upgradePrice: 22950,
    });
  });

  it.each([
    { init: 3, final: 3 },
    { init: 4, final: 2 },
  ])('should reject upgrade when finalTier ($final) <= initialTier ($init)', ({ init, final }) => {
    const res = calculateUpgrade({
      category: 'WEAPON',
      initialTier: init,
      finalTier: final,
    });
    expect(res.isValid).toBe(false);
    if (!res.isValid) {
      expect(res.error).toBe('INVALID_TIER_RANGE');
    }
  });

  it.each([
    { init: -1, final: 2 },
    { init: 1, final: -2 },
  ])('should reject negative tier parameters', ({ init, final }) => {
    const res = calculateUpgrade({
      category: 'WEAPON',
      initialTier: init,
      finalTier: final,
    });
    expect(res.isValid).toBe(false);
    if (!res.isValid) {
      expect(res.error).toBe('INVALID_PARAMETERS');
    }
  });
});

describe('calculateAmmoCraft - CDC Golden Test Cases', () => {
  it.each([
    { tier: 1, qty: 10, expected: 200 },
    { tier: 3, qty: 10, expected: 1800 },
    { tier: 1, qty: 50, expected: 1000 },
    { tier: 2, qty: 1, expected: 80 },
  ])('calculates base ammo prices: tier $tier, qty $qty -> $expected po', ({ tier, qty, expected }) => {
    const res = calculateAmmoCraft({
      effectiveTier: tier,
      quantity: qty,
    });
    expect(res.isValid).toBe(true);
    if (res.isValid) {
      expect(res.totalPrice).toBe(expected);
      expect(res.supplementsPrice).toBe(0);
    }
  });

  it('adds supplements accurately for ammo batches', () => {
    // 10 flèches +1 (N=1 base = 200 po) avec Incassable (+20 po/u) et Argentée (+10 po/u)
    const res = calculateAmmoCraft({
      effectiveTier: 1,
      quantity: 10,
      supplements: [20, 10],
    });
    expect(res).toEqual({
      isValid: true,
      effectiveTier: 1,
      quantity: 10,
      baseBatchPrice: 200,
      supplementsPrice: 300,
      totalPrice: 500,
    });
  });

  it.each([
    { qty: 0, tier: 1, error: 'INVALID_QUANTITY' },
    { qty: -5, tier: 1, error: 'INVALID_QUANTITY' },
    { qty: 10, tier: 0, error: 'INVALID_EFFECTIVE_TIER' },
    { qty: 10, tier: -1, error: 'INVALID_EFFECTIVE_TIER' },
  ])('rejects invalid ammo craft arguments: %j', ({ qty, tier, error }) => {
    const res = calculateAmmoCraft({
      effectiveTier: tier,
      quantity: qty,
    });
    expect(res.isValid).toBe(false);
    if (!res.isValid) {
      expect(res.error).toBe(error);
    }
  });
});
