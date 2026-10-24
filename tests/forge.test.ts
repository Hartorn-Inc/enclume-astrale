import { describe, expect, it } from 'vitest';
import {
  computeBaseTier,
  computeEffectiveTier,
  computeCeilingPrice,
  computeCraftQuote,
  computeUpgradeQuote,
  computeAmmoQuote,
  sumEnchantmentSlots,
  ItemCategory,
  AmmoSupplement,
} from '../src/domain/forge';

describe('computeBaseTier', () => {
  it.each([
    [0, 0],
    [1, 1],
    [2, 3],
    [3, 6],
    [4, 10],
  ])('should compute T(%i) = %i according to the arithmetic formula', (b, expected) => {
    expect(computeBaseTier(b)).toBe(expected);
  });

  it.each([-1, 5, 2.5, NaN])('should throw RangeError for invalid base bonus: %s', (invalidB) => {
    expect(() => computeBaseTier(invalidB)).toThrow(RangeError);
  });
});

describe('computeEffectiveTier', () => {
  it.each([
    [0, 0, 0],
    [1, 0, 1],
    [1, 1, 2],
    [2, 0, 3],
    [2, 2, 5],
    [3, 0, 6],
    [4, 0, 10],
  ])('should compute N = T(%i) + %i = %i', (baseBonus, slotCost, expectedEffectiveTier) => {
    expect(computeEffectiveTier(baseBonus, slotCost)).toBe(expectedEffectiveTier);
  });
});

describe('computeCeilingPrice', () => {
  it.each<[ItemCategory, number, number]>([
    ['WEAPON', 1, 1000],
    ['WEAPON', 3, 9000],
    ['WEAPON', 5, 25000],
    ['ARMOR_SHIELD', 3, 7650],
    ['ARMOR_SHIELD', 6, 30600],
    ['WONDROUS_ITEM', 4, 12800],
  ])('should compute ceiling price for %s at tier %i -> %i po', (category, tier, expected) => {
    expect(computeCeilingPrice(category, tier)).toBe(expected);
  });
});

describe('computeCraftQuote — Golden Test Cases & Capacity Rules', () => {
  it('evaluates Weapon +1 nue (B=1, S=0) -> 1 000 po', () => {
    const quote = computeCraftQuote({ category: 'WEAPON', baseBonus: 1, slotCost: 0 });
    expect(quote).toEqual({
      isValid: true,
      category: 'WEAPON',
      baseBonus: 1,
      slotCost: 0,
      baseTier: 1,
      effectiveTier: 1,
      ceilingPrice: 1000,
    });
  });

  it('evaluates Weapon +2 nue (B=2, S=0) -> 9 000 po', () => {
    const quote = computeCraftQuote({ category: 'WEAPON', baseBonus: 2, slotCost: 0 });
    expect(quote).toEqual({
      isValid: true,
      category: 'WEAPON',
      baseBonus: 2,
      slotCost: 0,
      baseTier: 3,
      effectiveTier: 3,
      ceilingPrice: 9000,
    });
  });

  it('evaluates Weapon +2 with S=2 (e.g. Sneaky + Frugal) -> 25 000 po', () => {
    const quote = computeCraftQuote({ category: 'WEAPON', baseBonus: 2, slotCost: 2 });
    expect(quote).toEqual({
      isValid: true,
      category: 'WEAPON',
      baseBonus: 2,
      slotCost: 2,
      baseTier: 3,
      effectiveTier: 5,
      ceilingPrice: 25000,
    });
  });

  it('rejects Weapon +2 with S=3 as invalid (CAPACITY_EXCEEDED)', () => {
    const quote = computeCraftQuote({ category: 'WEAPON', baseBonus: 2, slotCost: 3 });
    expect(quote).toEqual({
      isValid: false,
      error: 'CAPACITY_EXCEEDED',
    });
  });

  it('rejects Armor with S > B as CAPACITY_EXCEEDED', () => {
    const quote = computeCraftQuote({ category: 'ARMOR_SHIELD', baseBonus: 1, slotCost: 2 });
    expect(quote).toEqual({
      isValid: false,
      error: 'CAPACITY_EXCEEDED',
    });
  });

  it('allows Wondrous Item with B=0 and any positive slots', () => {
    const quote = computeCraftQuote({ category: 'WONDROUS_ITEM', baseBonus: 0, slotCost: 3 });
    expect(quote).toEqual({
      isValid: true,
      category: 'WONDROUS_ITEM',
      baseBonus: 0,
      slotCost: 3,
      baseTier: 0,
      effectiveTier: 3,
      ceilingPrice: 7200,
    });
  });

  it('rejects Wondrous Item if baseBonus > 0', () => {
    const quote = computeCraftQuote({ category: 'WONDROUS_ITEM', baseBonus: 1, slotCost: 2 });
    expect(quote).toEqual({
      isValid: false,
      error: 'WONDROUS_ITEM_NO_BASE_BONUS',
    });
  });

  it.each([
    [-1, 0, 'INVALID_BASE_BONUS'],
    [5, 0, 'INVALID_BASE_BONUS'],
    [1, -1, 'INVALID_SLOT_COST'],
  ])('handles input errors gracefully: baseBonus=%i slotCost=%i -> %s', (baseBonus, slotCost, expectedError) => {
    const quote = computeCraftQuote({ category: 'WEAPON', baseBonus, slotCost });
    expect(quote).toEqual({
      isValid: false,
      error: expectedError,
    });
  });
});

describe('computeUpgradeQuote', () => {
  it('calculates Armor +2 nue to +3 nue = 22 950 po (Golden Test Case)', () => {
    const upgrade = computeUpgradeQuote({
      category: 'ARMOR_SHIELD',
      initialBaseBonus: 2,
      initialSlotCost: 0,
      finalBaseBonus: 3,
      finalSlotCost: 0,
    });

    expect(upgrade).toEqual({
      isValid: true,
      category: 'ARMOR_SHIELD',
      initialTier: 3,
      finalTier: 6,
      initialCeilingPrice: 7650,
      finalCeilingPrice: 30600,
      upgradePrice: 22950,
    });
  });

  it('calculates Weapon +1 nue to Weapon +2 nue = 8 000 po', () => {
    const upgrade = computeUpgradeQuote({
      category: 'WEAPON',
      initialBaseBonus: 1,
      initialSlotCost: 0,
      finalBaseBonus: 2,
      finalSlotCost: 0,
    });

    expect(upgrade).toEqual({
      isValid: true,
      category: 'WEAPON',
      initialTier: 1,
      finalTier: 3,
      initialCeilingPrice: 1000,
      finalCeilingPrice: 9000,
      upgradePrice: 8000,
    });
  });

  it('rejects upgrade when target tier is less than or equal to initial tier', () => {
    const upgrade = computeUpgradeQuote({
      category: 'WEAPON',
      initialBaseBonus: 2,
      initialSlotCost: 0,
      finalBaseBonus: 2,
      finalSlotCost: 0,
    });
    expect(upgrade).toEqual({
      isValid: false,
      error: 'INVALID_UPGRADE_TIER',
    });
  });

  it('rejects upgrade if target configuration exceeds capacity', () => {
    const upgrade = computeUpgradeQuote({
      category: 'WEAPON',
      initialBaseBonus: 1,
      initialSlotCost: 0,
      finalBaseBonus: 2,
      finalSlotCost: 4,
    });
    expect(upgrade).toEqual({
      isValid: false,
      error: 'CAPACITY_EXCEEDED',
    });
  });
});

describe('computeAmmoQuote', () => {
  it('calculates 10 arrows +1 = 200 po (Golden Test Case)', () => {
    const result = computeAmmoQuote({ baseBonus: 1, quantity: 10 });
    expect(result).toEqual({
      isValid: true,
      effectiveTier: 1,
      quantity: 10,
      baseUnitCost: 20,
      supplementsUnitCost: 0,
      totalPrice: 200,
    });
  });

  it('calculates 10 arrows +2 = 1 800 po (Golden Test Case)', () => {
    const result = computeAmmoQuote({ baseBonus: 2, quantity: 10 });
    expect(result).toEqual({
      isValid: true,
      effectiveTier: 3,
      quantity: 10,
      baseUnitCost: 180,
      supplementsUnitCost: 0,
      totalPrice: 1800,
    });
  });

  it('calculates arrows with flat supplements (Silvered: +10 po/unit, Impact: +20 po/unit)', () => {
    const supplements: AmmoSupplement[] = ['SILVERED', 'IMPACT'];
    const result = computeAmmoQuote({
      baseBonus: 1,
      quantity: 10,
      supplements,
    });
    expect(result).toEqual({
      isValid: true,
      effectiveTier: 1,
      quantity: 10,
      baseUnitCost: 20,
      supplementsUnitCost: 30,
      totalPrice: 500,
    });
  });

  it('rejects invalid quantities', () => {
    expect(computeAmmoQuote({ baseBonus: 1, quantity: 0 })).toEqual({
      isValid: false,
      error: 'INVALID_QUANTITY',
    });
    expect(computeAmmoQuote({ baseBonus: 1, quantity: -5 })).toEqual({
      isValid: false,
      error: 'INVALID_QUANTITY',
    });
  });

  it('rejects ammo exceeding slot capacity', () => {
    expect(computeAmmoQuote({ baseBonus: 1, slotCost: 2, quantity: 10 })).toEqual({
      isValid: false,
      error: 'CAPACITY_EXCEEDED',
    });
  });
});

describe('sumEnchantmentSlots', () => {
  it('sums slots correctly', () => {
    const slots = [
      { id: '1', name: 'Sournoise', slotCost: 1 },
      { id: '2', name: 'Frugale', slotCost: 1 },
      { id: '3', name: 'Flamboyante', slotCost: 2 },
    ];
    expect(sumEnchantmentSlots(slots)).toBe(4);
    expect(sumEnchantmentSlots([])).toBe(0);
  });
});
